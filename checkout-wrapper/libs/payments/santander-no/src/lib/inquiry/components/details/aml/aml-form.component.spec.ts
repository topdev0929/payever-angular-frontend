import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { FormOptionInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';


import { flowWithPaymentOptionsFixture } from '../../../../test';

import { AmlFormComponent } from './aml-form.component';

const paySources: FormOptionInterface[] = [
  {
    label: 'source 1',
    value: 1,
  },
  {
    label: 'source 2',
    value: 2,
  },
];

describe('AmlFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: AmlFormComponent;
  let fixture: ComponentFixture<AmlFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        NgControl,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        AmlFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_NO]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          response: {
            payment: {},
            paymentDetails: {},
          },
          formOptions: {
            paySources, isAmlEnabled: true,
          },
        },
      },
    }));

    fixture = TestBed.createComponent(AmlFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should set up form controls and subscriptions', () => {
      jest.spyOn(store, 'select').mockReturnValue(of([]));
      jest.spyOn(store, 'selectSnapshot').mockReturnValue([]);

      const formGroupSpy = jest.spyOn(component.formGroup, 'get');
      const valueChangesSpy = jest.spyOn(component.formGroup.get('payWithMainIncome').valueChanges, 'pipe');

      component.ngOnInit();

      expect(formGroupSpy).toHaveBeenCalledWith('paySource');
      expect(valueChangesSpy).toHaveBeenCalled();
    });
    it('should enable or disabled paySource correctly', () => {
      component.ngOnInit();
      component.formGroup.get('payWithMainIncome').setValue(null);
      expect(component.formGroup.get('paySource').enabled).toBeTruthy();
      component.formGroup.get('payWithMainIncome').setValue(1000 as any);
      expect(component.formGroup.get('paySource').disabled).toBeTruthy();
    });
    it('should enable or disabled otherPaySource correctly', () => {
      const paySource = component.formGroup.get('paySource');
      const otherPaySource = component.formGroup.get('otherPaySource');

      component.ngOnInit();

      paySource.enable();
      paySource.setValue('OTHER');
      expect(otherPaySource.enabled).toBeTruthy();

      paySource.disable();
      paySource.setValue('OTHER');
      expect(otherPaySource.disabled).toBeTruthy();
    });
  });

  describe('Component', () => {
    it('should get paySourceOptions$', (done) => {
      component.paySourceOptions$.subscribe((options) => {
        expect(options).toEqual(paySources);
        done();
      });
    });
  });
});
