import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { EMPTY } from 'rxjs';

import { FinishModule } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalNavigateData, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  ParamsState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  ErrorDataInterface,
  FinishComponent,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { SantanderSeFinishModule } from '../../santander-se-finish.module';

import { FinishContainerComponent } from './finish-container.component';



describe('santander-se-finish-container', () => {
  let store: Store;

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(FinishModule),
        RouterModule.forRoot([]),
      ],
      providers: [
        importProvidersFrom(SantanderSeFinishModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        ExternalNavigateData,
      ],
      declarations: [
        MockComponent(FinishComponent),
        FinishContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  const getFinishComponent = () => {
    const finishEl = fixture.debugElement.query(By.directive(FinishComponent));
    const finishComponent: FinishComponent = finishEl.componentInstance;

    expect(finishEl).toBeTruthy();
    expect(finishComponent).toBeTruthy();

    return {
      finishEl,
      finishComponent,
    };
  };

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  const checkChildInputs = () => {
    const { finishComponent } = getFinishComponent();
    expect(finishComponent).toBeTruthy();

    const flow = store.selectSnapshot(FlowState.flow);
    const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);
    const merchantMode = store.selectSnapshot(ParamsState.merchantMode);

    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.merchantMode).toEqual(merchantMode);
    expect(finishComponent.isDisableChangePayment).toEqual(component.isDisableChangePayment);
    expect(finishComponent.nodeResult).toEqual(component.paymentResponse);
    expect(finishComponent.showCloseButton).toEqual(!!flow.apiCall.cancelUrl);
    expect(finishComponent.isLoading).toEqual(!component.paymentResponse && !component.errorMessage);
    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
  };

  describe('component', () => {
    it('should provide inputs to the finishComponent, correctly', () => {
      checkChildInputs();
    });

    it('should use process payment service on onStartSigning method', () => {
      const processPaymentSpy = jest.spyOn(SantanderSePaymentProcessService.prototype, 'onStartSigning')
        .mockImplementation(() => EMPTY);
      component.onStartSigning();
      expect(processPaymentSpy).toHaveBeenCalled();
    });


    it('should set paymentResponse on showFinishModalFromExistingPayment ', () => {
      const nodePaymentData: ReturnType<NodeFlowService['getFinalResponse']> = {
        id: '123',
        paymentDetails: {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
          paymentMethodDetails: {},
        },
        createdAt: Date.now().toString(),
        payment: null,
        paymentItems: [],
      };
      const processPaymentSpy = jest.spyOn(NodeFlowService.prototype, 'getFinalResponse')
        .mockImplementation(() => nodePaymentData);
      component.showFinishModalFromExistingPayment();
      expect(processPaymentSpy).toHaveBeenCalled();
      expect(component.paymentResponse).toEqual(nodePaymentData);
    });
  });

  it('should set error on paymentStateService errors', () => {
    const error: ErrorDataInterface = {
      error: { santander_se: 'fake error' },
      errorMessage: 'some fake error message',
    };
    const stateService = TestBed.inject(SantanderSePaymentStateService);
    stateService.error$.next(error);
    fixture.detectChanges();

    expect(component.errors).toEqual(error.error);
    expect(component.errorMessage).toEqual(error.errorMessage);

  });
});

