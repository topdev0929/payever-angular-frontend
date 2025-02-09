

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { hot } from 'jest-marbles';
import { MockModule } from 'ng-mocks';
import { ReplaySubject, of } from 'rxjs';

import { FinishDialogService } from '@pe/checkout/finish';
import { SectionStorageService } from '@pe/checkout/form-utils';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ParamsState, PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';

import { SantanderSeInquiryModule } from '../../../../inquiry/santander-se-inquiry.module';
import { UtilStepService } from '../../../../services';
import {
  FinishComponent,
  SantanderSeFlowService,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
} from '../../../../shared/common';
import { UpdatePaymentModeEnum } from '../../../../shared/enums';
import { PaymentOptions, flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { clearValidators } from '../../../../test/utils';
import { SantanderSeInquiryEbaModule } from '../../inquire-eba.module';

import { InquireEbaComponent } from './inquire-eba.component';





describe('pe-santander-se-inquire-eba', () => {
  let component: InquireEbaComponent;
  let fixture: ComponentFixture<InquireEbaComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof InquireEbaComponent>['formGroup'];

  beforeEach(() => {
    const fb = new FormBuilder();
    const financeDetailsForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputModule,
        MockModule(SantanderSeInquiryEbaModule),
        MockModule(SantanderSeInquiryModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: financeDetailsForm,
        },
        UtilStepService,
        SantanderSeFlowService,
      ],
      declarations: [
        InquireEbaComponent,
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

    fixture = TestBed.createComponent(InquireEbaComponent);
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
      component.formGroup.patchValue({ householdForm: { accommodationType: true } });
      expect(spy).toHaveBeenCalledWith(new PatchFormState(formGroup.value));
    });
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
    jest.spyOn(TestBed.inject(SantanderSeFlowService), 'postMoreInfo').mockReturnValue(of(paymentData));
    const paymentService = TestBed.inject(SantanderSePaymentStateService);
    const sectionService = TestBed.inject(SectionStorageService);
    const disableHideOnNextNavigate = jest.spyOn(TestBed.inject(FinishDialogService), 'disableHideOnNextNavigate');
    const runUpdatePaymentWithTimeout = jest.spyOn(
      TestBed.inject(SantanderSePaymentProcessService),
      'runUpdatePaymentWithTimeout'
    );

    const isSendingPayment$ = new ReplaySubject<boolean>();
    component.isSendingPayment$.subscribe(isSendingPayment$);

    component.submitted.subscribe((v) => {
      expect(v).toEqual(formGroup.value);
      expect(preparePaymentData).toBeCalledWith(formGroup.value);
      expect(paymentService.paymentResponse).toEqual(paymentData);
      expect(sectionService.isPassedPaymentData).toEqual(true);
      expect(disableHideOnNextNavigate).toBeCalled();
      expect(runUpdatePaymentWithTimeout).toBeCalledWith(UpdatePaymentModeEnum.WaitingForSigningURL);
      expect(isSendingPayment$).toBeObservable(hot('(ftf)', { t: true, f: false }));
      done();
    });

    clearValidators(formGroup);

    const continueButtonEL = fixture.debugElement.query(By.directive(ContinueButtonComponent));
    continueButtonEL.componentInstance.clicked.emit();
  });

  it('should show loading on isPassedPaymentData$', () => {
    component.isSendingPayment$.next(true);
    fixture.detectChanges();

    const merchantMode = store.selectSnapshot(ParamsState.merchantMode);
    const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);

    const finishComponentEL = fixture.debugElement.query(By.directive(FinishComponent));
    expect(finishComponentEL).toBeTruthy();
    const finishComponent = finishComponentEL.componentInstance;

    expect(finishComponent.isLoading).toBe(true);
    expect(finishComponent.merchantMode).toBe(merchantMode);
    expect(finishComponent.embeddedMode).toBe(embeddedMode);
  });
});

