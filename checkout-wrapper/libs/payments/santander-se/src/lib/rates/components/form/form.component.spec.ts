import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { Subject, of } from 'rxjs';

import { DialogModule } from '@pe/checkout/dialog';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { FlowState, PaymentState, SetFlow, SetPayments, SetPaymentOptions } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, SalesScoringType } from '@pe/checkout/types';

import { UtilStepService } from '../../../services';
import {
  RateInterface,
} from '../../../shared';
import { flowWithPaymentOptionsFixture, PaymentOptions } from '../../../test/fixtures';
import { clearValidators } from '../../../test/utils/';
import { SantanderSeRatesModule } from '../../santander-se-rates.module';
import { RatesEditListComponent } from '../rates-edit-list/rates-edit-list.component';
import { SsnFormComponent } from '../ssn-form';
import { TermsFormComponent } from '../terms-form';

import { FormComponent } from './form.component';

const initialRates: RateInterface[] = [
  {
    annualFee: 0,
    baseInterestRate: 0,
    billingFee: 0,
    code: '3006',
    effectiveInterest: 5.3,
    monthlyCost: 2167,
    months: 6,
    payLaterType: true,
    startupFee: 195,
    totalCost: 13195,
  },
  {
    annualFee: 0,
    baseInterestRate: 11.05,
    billingFee: 30,
    code: '8411',
    effectiveInterest: 18.29,
    monthlyCost: 278,
    months: 72,
    payLaterType: false,
    startupFee: 495,
    totalCost: 20495,
  },
];

describe('santander-se-rates-form', () => {
  let store: Store;

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let formGroup: InstanceType<typeof FormComponent>['formGroup'];
  const submit$ = new Subject<number>();


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        DialogModule,
        MockModule(RatesModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SantanderSeRatesModule),
        MockComponent(RatesEditListComponent),
        PaymentInquiryStorage,
        SsnFormComponent,
        TermsFormComponent,
        FormComponent,
        { provide: PaymentSubmissionService, useValue: submit$ },
      ],
      declarations: [
        RatesEditListComponent,
        FormComponent,
        SsnFormComponent,
        TermsFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  const initializeComponent = () => {
    component.onRateSelected({ rate: null, data: { campaignCode: 'fakeCampaignCode' } });
    fixture.detectChanges();

    // grab ratesEditListComponent
    const ratesEditListEl = fixture.debugElement.query(By.directive(RatesEditListComponent));
    expect(ratesEditListEl).toBeTruthy();
    const ratesEditListComponent: RatesEditListComponent = ratesEditListEl.componentInstance;
    expect(ratesEditListComponent).toBeTruthy();
    fixture.detectChanges();

    return {
      ratesEditListEl,
      ratesEditListComponent,
    };
  };

  describe('component', () => {
    it('it should provide inputs to RatesEditListComponent correctly', () => {
      const { ratesEditListComponent } = initializeComponent();

      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);

      expect(ratesEditListComponent.flowId).toEqual(flow.id);
      expect(ratesEditListComponent.paymentMethod).toEqual(paymentMethod);
      expect(ratesEditListComponent.total).toEqual(flow.total);
      expect(ratesEditListComponent.currency).toEqual(flow.currency);
      expect(ratesEditListComponent.initialData).toEqual({ campaignCode: 'fakeCampaignCode' });
    });

    it('should react to selected rate', () => {
      const { ratesEditListComponent } = initializeComponent();
      const selectRate = jest.spyOn(component.selectRate, 'next');
      ratesEditListComponent.selected.emit({
        rate: initialRates[1],
        data: { campaignCode: initialRates[1].code },
      });
      fixture.detectChanges();

      expect(formGroup.get('ratesForm.campaignCode').value).toEqual(initialRates[1].code);
      expect(selectRate).toBeCalledWith(initialRates[1]);
    });

    it('setSalesScoringType should work as expected', async () => {
      const { ratesEditListComponent } = initializeComponent();
      ratesEditListComponent.selected.emit({
        rate: initialRates[1],
        data: { campaignCode: initialRates[1].code },
      });
      jest.spyOn(UtilStepService.prototype, 'getCountries').mockReturnValue(of([{
        label: '',
        value: 'SE',
        iconRef: '',
        imgRef: '',
        groupId: '',
        hexColor: '',
      }]));
      store.dispatch(new SetPayments({
        [PaymentMethodEnum.SANTANDER_INSTALLMENT_SE]: {
          [flowWithPaymentOptionsFixture().connectionId]: {
            ...store.selectSnapshot(PaymentState),
            formOptions: PaymentOptions,
          },
        },
      }));

      component.setSalesScoringType(SalesScoringType.Authorization);
      fixture.detectChanges();


      expect(formGroup.get('ratesForm.campaignCode').value).toEqual(initialRates[1].code);
      expect(formGroup.get('_authorizedForm').value).toEqual({ employmentType: 'Permanent', citizenship: 'SE' });

      component.setSalesScoringType(SalesScoringType.New);
      fixture.detectChanges();

      expect(formGroup.get('ratesForm.campaignCode').value).toEqual(initialRates[1].code);
      expect(formGroup.get('_authorizedForm').disabled).toBe(true);
    });

    it('setInquiryId should work as expected', () => {
      component.setInquiryId('fakeInquiryId');

      expect(formGroup.get('ratesForm.inquiryId').value).toEqual('fakeInquiryId');
    });

    it('emit submitted', (done) => {
      initializeComponent();
      component.submitted.subscribe((v) => {
        expect(v).toEqual(formGroup.value);
        done();
      });

      clearValidators(formGroup);
      formGroup.updateValueAndValidity();
      submit$.next(Date.now());
    });
  });

  describe('setAuthorizedForm', () => {
    it('should disable _authorizedForm', () => {
      component.setAuthorizedForm(SalesScoringType.New);
      expect(component.formGroup.get('_authorizedForm').disabled).toBeTruthy();
    });
    it('should patch empty string if employmentType or country values is null', () => {
      store.dispatch(new SetPaymentOptions({
        ...PaymentOptions,
        employmentType: [
          { value: null },
        ],
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      jest.spyOn(component['utilStepService'], 'getCountries')
        .mockReturnValue(of([{ value: null }] as any));
      component.setAuthorizedForm(SalesScoringType.Authorization);
      fixture.detectChanges();
      expect(component.formGroup.get('_authorizedForm').enabled).toBeTruthy();
      expect(component.formGroup.get('_authorizedForm').value).toMatchObject({
        employmentType: '',
        citizenship: '',
      });
    });
    it('should patch formGroup values correctly', () => {
      store.dispatch(new SetPaymentOptions({
        ...PaymentOptions,
        employmentType: [
          { value: 1 },
        ],
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      jest.spyOn(component['utilStepService'], 'getCountries')
        .mockReturnValue(of([{ value: 'SE' }] as any));
      component.setAuthorizedForm(SalesScoringType.Authorization);
      fixture.detectChanges();
      expect(component.formGroup.get('_authorizedForm').enabled).toBeTruthy();
      expect(component.formGroup.get('_authorizedForm').value).toMatchObject({
        employmentType: '1',
        citizenship: 'SE',
      });
    });
  });
});
