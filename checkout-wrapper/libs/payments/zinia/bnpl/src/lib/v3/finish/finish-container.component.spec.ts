
import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';

import { FinishModule } from '@pe/checkout/finish';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  ParamsState,
  SetFlow,
  SetPaymentError,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { ResponseErrorsInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { FinishComponent } from './finish';
import { FinishContainerComponent } from './finish-container.component';
import { ZiniaBNPLFinishModuleV3 } from './zinia-bnpl-finish.module';

describe('zinia-bnpl-finish-container-v3', () => {
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
        importProvidersFrom(ZiniaBNPLFinishModuleV3),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
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


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  const checkChildInputs = () => {
    const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
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

    it('should set error message', () => {
      const error: ResponseErrorsInterface = {
        code: 400,
        errors: {
          error: 'error',
        },
        message: 'errorMessage',
        raw: new HttpErrorResponse({ status: 400 }),
      };

      store.dispatch(new SetPaymentError(error));
      fixture.detectChanges();

      expect(component.errorMessage).toEqual('errorMessage');
      checkChildInputs();
    });
  });
});
