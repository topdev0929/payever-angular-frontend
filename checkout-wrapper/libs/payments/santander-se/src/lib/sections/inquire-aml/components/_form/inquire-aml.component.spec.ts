import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { hot } from 'jest-marbles';
import { MockComponents, MockModule } from 'ng-mocks';
import { ReplaySubject, of } from 'rxjs';

import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';

import { SantanderSeInquiryModule } from '../../../../inquiry/santander-se-inquiry.module';
import { UtilStepService } from '../../../../services';
import { FinishComponent, SantanderSePaymentProcessService } from '../../../../shared/common';
import { PaymentOptions, flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { clearValidators } from '../../../../test/utils';
import { ExposedPersonFormComponent } from '../exposed-person-form';
import { FinanceDetailsFormComponent } from '../finance-details-form';
import { PersonalFormComponent } from '../personal-form';

import { InquireAmlComponent } from './inquire-aml.component';



describe('pe-santander-se-inquire-aml', () => {
  let component: InquireAmlComponent;
  let fixture: ComponentFixture<InquireAmlComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof InquireAmlComponent>['formGroup'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputModule,
        MockModule(SantanderSeInquiryModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        UtilStepService,
      ],
      declarations: [
        InquireAmlComponent,
        MockComponents(
          PersonalFormComponent,
          ExposedPersonFormComponent,
          FinanceDetailsFormComponent,
          ContinueButtonComponent,
          FinishComponent,
        ),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_SE]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: PaymentOptions,
        },
      },
    }));

    fixture = TestBed.createComponent(InquireAmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should patch formState on fromValueChanges', () => {
      const spy = jest.spyOn(store, 'dispatch');
      component.formGroup.patchValue({ personalForm: { citizenship: 'test' } });
      expect(spy).toHaveBeenCalledWith(new PatchFormState(formGroup.value));
    });


    it('should post payment data on submit ', (done) => {
      const paymentData: NodePaymentResponseInterface<null> = {
        createdAt: new Date().toString(),
        id: 'id',
        payment: null,
        paymentDetails: null,
        paymentItems: [],
      };

      const preparePaymentData = jest.spyOn(TestBed.inject(SantanderSePaymentProcessService), 'preparePaymentData')
        .mockReturnValue(of({} as any));
      jest.spyOn(TestBed.inject(NodeFlowService), 'postPayment').mockReturnValue(of(paymentData));

      const isSendingPayment$ = new ReplaySubject<boolean>();
      component.isSendingPayment$.subscribe(isSendingPayment$);

      component.submitted.subscribe((v) => {
        expect(v).toEqual(formGroup.value);
        expect(isSendingPayment$).toBeObservable(hot('(ftf)', { t: true, f: false }));
        done();
      });

      clearValidators(formGroup);
      component.onSubmit();
      expect(preparePaymentData).toBeCalledWith(formGroup.value);
    });
  });
});

