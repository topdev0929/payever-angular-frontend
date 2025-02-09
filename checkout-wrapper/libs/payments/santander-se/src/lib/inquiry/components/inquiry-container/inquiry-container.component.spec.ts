import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { MockComponents, MockProvider } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';

import { ApiService, TrackingService } from '@pe/checkout/api';
import { FinishDialogService } from '@pe/checkout/finish';
import { FinishWrapperComponent } from '@pe/checkout/finish/components';
import { PaymentSectionsComponent, SectionDataInterface } from '@pe/checkout/form-utils';
import {
  ChangeFailedPayment,
  FlowState,
  ParamsState,
  PatchFlow,
  PaymentState,
  SetFlow,
  SetPayments,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ChangePaymentDataInterface, FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import {
  SharedModule,
  FinishComponent,
  FormConfigService,
  SantanderSePaymentProcessService,
} from '../../../shared';
import { PaymentOptions, flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test/fixtures';
import { SantanderSeInquiryModule } from '../../santander-se-inquiry.module';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('santander-se-inquiry-container', () => {
  let store: Store;

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        importProvidersFrom(SantanderSeInquiryModule),
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
        MockProvider(TrackingService),
        PaymentSectionsComponent,
        FinishComponent,
        InquiryContainerComponent,
        MockProvider(FormConfigService),
        SantanderSePaymentProcessService,
      ],
      declarations: [
        MockComponents(FinishWrapperComponent),
        PaymentSectionsComponent,
        FinishComponent,
        InquiryContainerComponent,
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

    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  const getFinishComponent = () => {
    const finishComponentEl = fixture.debugElement.query(By.directive(FinishComponent));
    const finishComponent: FinishComponent = finishComponentEl.componentInstance;

    expect(finishComponentEl).toBeTruthy();
    expect(finishComponent).toBeTruthy();

    return {
      finishComponentEl,
      finishComponent,
    };
  };

  const getPaymentSectionsComponent = () => {
    const paymentSectionsEl = fixture.debugElement.query(By.directive(PaymentSectionsComponent));
    const paymentSectionsComponent: PaymentSectionsComponent = paymentSectionsEl.componentInstance;

    expect(paymentSectionsEl).toBeTruthy();
    expect(paymentSectionsComponent).toBeTruthy();

    return {
      paymentSectionsEl,
      paymentSectionsComponent,
    };
  };

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });


  describe('component', () => {
    it('should set PaymentSectionsComponent inputs correctly', () => {
      const { paymentSectionsComponent } = getPaymentSectionsComponent();

      fixture.detectChanges();
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const merchantMode = store.selectSnapshot(ParamsState.merchantMode);
      const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);

      expect(paymentSectionsComponent.sectionsConfig).toEqual(component.sectionsConfig);
      expect(paymentSectionsComponent.flow).toEqual(flow);
      expect(paymentSectionsComponent.nodeFormOptions).toEqual(PaymentOptions);
      expect(paymentSectionsComponent.doSubmit$).toEqual(component.doSubmit$);
      expect(paymentSectionsComponent.paymentMethod).toEqual(paymentMethod);
      expect(paymentSectionsComponent.merchantMode).toEqual(merchantMode);
      expect(paymentSectionsComponent.paymentMethod).toEqual(paymentMethod);
      expect(paymentSectionsComponent.embeddedMode).toEqual(embeddedMode);
    });

    it('should dispatch ChangeFailedPayment on changePayment method', () => {
      const data: ChangePaymentDataInterface = { redirectUrl: 'fakeUrl' };
      store.dispatch = jest.fn();
      component.changePayment(data);

      expect(store.dispatch).toHaveBeenCalledWith(new ChangeFailedPayment(data));
    });

    it('should call checkStepsLogic on checkStepsLogic method', () => {
      const formConfigService = TestBed.inject(FormConfigService);
      formConfigService.checkStepsLogic = jest.fn().mockImplementation((_, data) => of(data));

      const data: SectionDataInterface[] = [{
        name: 'fakeSection',
      }];
      component.checkStepsLogic(data);

      expect(component.formSectionsData).toEqual(data);
    });

    it('should call checkStepsLogic on loadedLazyModule method', () => {
      const formConfigService = TestBed.inject(FormConfigService);
      formConfigService.checkStepsLogic = jest.fn().mockImplementation((_, data) => of(data));

      const data: SectionDataInterface[] = [{
        name: 'fakeSection',
      }];
      component.loadedLazyModule(data);

      expect(formConfigService.checkStepsLogic).toBeCalled();
      expect(component.formSectionsData).toEqual(data);
    });

    const shouldCallSendPaymentData = () => {
      const formData = store.selectSnapshot(PaymentState.form);
      const formConfigService = TestBed.inject(FormConfigService);
      const preparePaymentData = jest.spyOn(SantanderSePaymentProcessService.prototype, 'preparePaymentData')
        .mockReturnValue(EMPTY);
      const disableHideOnNextNavigate = jest.spyOn(FinishDialogService.prototype, 'disableHideOnNextNavigate');
      formConfigService.checkStepsLogic = jest.fn().mockImplementation((_, data) => of(data));
      const emitContinue = jest.spyOn(component.continue, 'emit');

      return (sectionsData: SectionDataInterface[]) => {
        expect(component.formSectionsData).toEqual(sectionsData);
        expect(preparePaymentData).toBeCalledWith(formData);
        expect(disableHideOnNextNavigate).toBeCalled();
        expect(component.isSendingPayment$).toBeObservable(cold('t', { t: true }));
        expect(emitContinue).toBeCalled();
      };
    };

    it('should call sendPaymentData if all sections are disabled', () => {
      const expect = shouldCallSendPaymentData();
      const data: SectionDataInterface[] = [{
        name: 'fakeSection',
        isDisabled: true,
      }];

      component.checkStepsLogic(data);

      expect(data);
    });

    it('should call sendPaymentData on finishedModalShown method', () => {
      const expect = shouldCallSendPaymentData();
      component.finishedModalShown(null);
      expect([]);
    });

  });

  describe('should react to flow changes', () => {
    const cases: Partial<FlowInterface>[] = [
      { amount: 10_000 },
      { amount: 2_000 },
      { amount: 300_000 },
    ];

    cases.forEach((patch, i) => {
      it(`#${i}`, () => {
        store.dispatch(new PatchFlow(patch));

        fixture.detectChanges();
        const flow = store.selectSnapshot(FlowState.flow);

        const { paymentSectionsComponent } = getPaymentSectionsComponent();
        expect(paymentSectionsComponent.flow).toEqual(flow);
      });
    });
  });

  it('should show finish with proper inputs', () => {
    component.finishedModalShown(null);
    fixture.detectChanges();
    const { finishComponent } = getFinishComponent();
    const merchantMode = store.selectSnapshot(ParamsState.merchantMode);
    const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);

    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.merchantMode).toEqual(merchantMode);
    expect(finishComponent.isLoading).toEqual(true);
  });

  describe('showFinishModalFromExistingPayment', () => {
    it('should set isPassedPaymentData if isNeedMoreInfo true', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(PaymentResponseWithStatus(null, null));
      jest.spyOn(component['santanderSeFlowService'], 'isNeedMoreInfo').mockReturnValue(true);
      component['showFinishModalFromExistingPayment']();
      expect(component['sectionStorageService'].isPassedPaymentData).toBeFalsy();
    });
    it('should not update isPassedPaymentData if isNeedMoreInfo false', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(PaymentResponseWithStatus(null, null));
      jest.spyOn(component['santanderSeFlowService'], 'isNeedMoreInfo').mockReturnValue(false);
      component['showFinishModalFromExistingPayment']();
      expect(component['sectionStorageService'].isPassedPaymentData).toBeNull();
    });
    it('should not update isPassedPaymentData if nodeResponse is not found', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(null);
      jest.spyOn(component['santanderSeFlowService'], 'isNeedMoreInfo').mockReturnValue(true);
      component['showFinishModalFromExistingPayment']();
      expect(component['sectionStorageService'].isPassedPaymentData).toBeNull();
    });
  });

});

