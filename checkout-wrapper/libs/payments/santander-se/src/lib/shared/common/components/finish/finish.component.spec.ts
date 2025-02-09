import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { MockBuilder, MockRender, MockModule, ngMocks, MockService } from 'ng-mocks';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { FinishWrapperComponent } from '@pe/checkout/finish/components';
import { ApiCallUrlService } from '@pe/checkout/node-api';
import { StorageModule } from '@pe/checkout/storage';
import {
  CheckoutState,
  FlowState,
  ParamsState,
  PatchParams,
  PaymentState,
  SetFlow,
  SettingsState,
  StepsState,
  StoreModule,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { MobileSigningStatusesEnum } from '../../../enums';
import { SharedModule } from '../../../shared.module';
import { SantanderSePaymentStateService } from '../../services';



import { FinishComponent } from './finish.component';



const nodeResult: NodePaymentResponseInterface<any> = {
  createdAt: new Date().toString(),
  id: 'id',
  payment: null,
  paymentItems: [],
  paymentDetails: {},
};

describe('santander-se-shared-finish', () => {
  let store: Store;

  beforeEach(() => {
    const module = MockBuilder(FinishComponent, SharedModule)
      .keep(StoreModule, {
        exportAll: true,
        export: true,
      })
      .provide([
        ...CommonProvidersTestHelper(),
        { provide: ApiCallUrlService, useValue: MockService(ApiCallUrlService) },
      ])
      .build();

    TestBed.configureTestingModule({
      ...module,
      imports: [
        ...module.imports,
        ...CommonImportsTestHelper(),
        MockModule(StorageModule),
        NgxsModule.forRoot([
          CheckoutState,
          FlowState,
          ParamsState,
          PaymentState,
          SettingsState,
          StepsState,
        ]),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  const getComponent = () => {
    const fixture = MockRender(FinishComponent, { nodeResult }, { reset: true });
    const component = fixture.point.componentInstance;

    return {
      fixture,
      component,
    };
  };


  describe('Constructor', () => {
    it('Should create an instance and extend AbstractFinishComponent', () => {
      const { component } = getComponent();
      expect(component).toBeTruthy();
      expect(component).toBeInstanceOf(AbstractFinishComponent);
    });

  });

  describe('component', () => {
    it('Should emit onStartSigning', () => {
      const { component } = getComponent();
      const spy = jest.spyOn(component.startSigning, 'emit');
      component.onStartSigning();
      expect(spy).toHaveBeenCalled();
    });
  });


  describe('isSigning', () => {
    const mocks = ({
      component,
      status,
      specificStatus,
      isCheckStatusProcessing,
      isReadyForStartSigning,
      mobileSigningStatus,
    }: {
      component: FinishComponent;
      status: PaymentStatusEnum;
      specificStatus: PaymentSpecificStatusEnum,
      isCheckStatusProcessing: boolean;
      isReadyForStartSigning: boolean;
      mobileSigningStatus: MobileSigningStatusesEnum;
    }) => {
      jest.spyOn(component, 'status', 'get').mockReturnValue(status);
      jest.spyOn(component, 'specificStatus', 'get').mockReturnValue(specificStatus);
      const paymentStateService = ngMocks.get(SantanderSePaymentStateService);
      paymentStateService.isCheckStatusProcessing$.next(isCheckStatusProcessing);
      paymentStateService.isReadyForStartSigning$.next(isReadyForStartSigning);
      component.nodeResult = {
        createdAt: new Date().toString(),
        id: 'id',
        payment: null,
        paymentItems: [],
        paymentDetails: {
          mobileSigningStatus,
        },
      };
    };

    const ShouldReturnTrue: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        status: PaymentStatusEnum.STATUS_IN_PROCESS,
        specificStatus: PaymentSpecificStatusEnum.STATUS_PENDING,
        isCheckStatusProcessing: false,
        isReadyForStartSigning: true,
        mobileSigningStatus: MobileSigningStatusesEnum.Created,
      },
    ];
    const ShouldReturnFalse: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        status: PaymentStatusEnum.STATUS_FAILED,
        specificStatus: PaymentSpecificStatusEnum.STATUS_ACTIVATED,
        isCheckStatusProcessing: false,
        isReadyForStartSigning: false,
        mobileSigningStatus: MobileSigningStatusesEnum.Completed,
      },
    ];

    const cases = [
      ...ShouldReturnTrue.map(c => ({ expected: true, state: c })),
      ...ShouldReturnFalse.map(c => ({ expected: false, state: c })),
    ];

    cases.forEach(({ state, expected }) => {
      it(`Should return ${expected} when state is ${JSON.stringify(state)}`, () => {
        const { component } = getComponent();
        mocks({ component, ...state });
        const res = component.isSigning();
        expect(res).toBe(expected);
      });
    });
  });
  describe('isStatusSuccess', () => {
    const mocks = ({
      component,
      isSigning,
      isStatusSuccess,
      isUpdatePaymentTimeout,
    }: {
      component: FinishComponent;
      isSigning: boolean;
      isStatusSuccess: boolean;
      isUpdatePaymentTimeout: boolean;
    }) => {
      const paymentStateService = ngMocks.get(SantanderSePaymentStateService);
      paymentStateService.isUpdatePaymentTimeout$.next(isUpdatePaymentTimeout);
      jest.spyOn(component, 'isSigning').mockReturnValue(isSigning);
      jest.spyOn(AbstractFinishComponent.prototype, 'isStatusSuccess').mockReturnValue(isStatusSuccess);
    };
    const ShouldReturnTrue: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: false,
        isStatusSuccess: true,
        isUpdatePaymentTimeout: false,
      },
    ];
    const ShouldReturnFalse: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: false,
        isStatusSuccess: true,
        isUpdatePaymentTimeout: true,
      },
      {
        isSigning: true,
        isStatusSuccess: true,
        isUpdatePaymentTimeout: false,
      },
    ];
    const cases = [
      ...ShouldReturnTrue.map(c => ({ expected: true, state: c })),
      ...ShouldReturnFalse.map(c => ({ expected: false, state: c })),
    ];

    cases.forEach(({ state, expected }) => {
      it(`Should return ${expected} when state is ${JSON.stringify(state)}`, () => {
        const { component } = getComponent();
        mocks({ component, ...state });
        const res = component.isStatusSuccess();
        expect(res).toBe(expected);
      });
    });

  });

  describe('isStatusPending', () => {
    const mocks = ({
      component,
      isSigning,
      isStatusPending,
    }: {
      component: FinishComponent;
      isSigning: boolean;
      isStatusPending: boolean;
    }) => {
      jest.spyOn(component, 'isSigning').mockReturnValue(isSigning);
      jest.spyOn(AbstractFinishComponent.prototype, 'isStatusPending').mockReturnValue(isStatusPending);
    };
    const ShouldReturnTrue: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: false,
        isStatusPending: true,
      },
    ];
    const ShouldReturnFalse: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: false,
        isStatusPending: false,
      },
      {
        isSigning: true,
        isStatusPending: false,
      },
      {
        isSigning: true,
        isStatusPending: true,
      },
    ];
    const cases = [
      ...ShouldReturnTrue.map(c => ({ expected: true, state: c })),
      ...ShouldReturnFalse.map(c => ({ expected: false, state: c })),
    ];

    cases.forEach(({ state, expected }) => {
      it(`Should return ${expected} when state is ${JSON.stringify(state)}`, () => {
        const { component } = getComponent();
        mocks({ component, ...state });
        const res = component.isStatusPending();
        expect(res).toBe(expected);
      });
    });

  });

  describe('isStatusFail', () => {
    const mocks = ({
      component,
      isSigning,
      isStatusFail,
      isUpdatePaymentTimeout,
    }: {
      component: FinishComponent;
      isSigning: boolean;
      isStatusFail: boolean;
      isUpdatePaymentTimeout: boolean;
    }) => {
      const paymentStateService = ngMocks.get(SantanderSePaymentStateService);
      paymentStateService.isUpdatePaymentTimeout$.next(isUpdatePaymentTimeout);
      jest.spyOn(AbstractFinishComponent.prototype, 'isStatusFail').mockReturnValue(isStatusFail);
      jest.spyOn(component, 'isSigning').mockReturnValue(isSigning);
    };
    const ShouldReturnTrue: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: false,
        isStatusFail: false,
        isUpdatePaymentTimeout: true,
      },
      {
        isSigning: false,
        isStatusFail: true,
        isUpdatePaymentTimeout: false,
      },
    ];
    const ShouldReturnFalse: Omit<Parameters<typeof mocks>[0], 'component'>[] = [
      {
        isSigning: true,
        isStatusFail: true,
        isUpdatePaymentTimeout: true,
      },
    ];
    const cases = [
      ...ShouldReturnTrue.map(c => ({ expected: true, state: c })),
      ...ShouldReturnFalse.map(c => ({ expected: false, state: c })),
    ];

    cases.forEach(({ state, expected }) => {
      it(`Should return ${expected} when state is ${JSON.stringify(state)}`, () => {
        const { component } = getComponent();
        mocks({ component, ...state });
        const res = component.isStatusFail();
        expect(res).toBe(expected);
      });
    });
  });

  it('should set proper inputs on FinishWrapperComponent', () => {
    jest.spyOn(AbstractFinishComponent.prototype, 'errorMessage', 'get').mockReturnValue('fake-eror');
    jest.spyOn(AbstractFinishComponent.prototype, 'getIframeCallbackUrl').mockReturnValue('callback-url');
    store.dispatch(new PatchParams({ merchantMode: true }));
    const { fixture, component } = getComponent();
    const finishWrapper = ngMocks.reveal(fixture, 'checkout-sdk-finish-wrapper');
    const finishWrapperComponent = ngMocks.findInstance(FinishWrapperComponent);
    component.isDisableChangePayment = true;
    component.isChangingPaymentMethod = true;
    component.merchantMode = true;
    component.embeddedMode = true;


    expect(ngMocks.input(finishWrapper, 'errorMessage')).toBe('fake-eror');
    expect(ngMocks.input(finishWrapper, 'iframeCallbackUrl')).toBe('callback-url');
    component.isLoading = true;
    const paymentStateService = ngMocks.get(SantanderSePaymentStateService);
    paymentStateService.isWaitingForSignUrl$.next(false);
    component.isLoading = true;
    fixture.detectChanges();
    expect(ngMocks.input(finishWrapper, 'isLoading')).toBe(true);
    component.isLoading = false;
    paymentStateService.isWaitingForSignUrl$.next(true);
    fixture.detectChanges();
    expect(ngMocks.input(finishWrapper, 'isLoading')).toBe(true);
    expect(ngMocks.input(finishWrapper, 'isDisableChangePayment')).toBe(true);
    expect(ngMocks.input(finishWrapper, 'isChangingPaymentMethod')).toBe(true);
    expect(ngMocks.input(finishWrapper, 'merchantMode')).toBe(true);
    expect(ngMocks.input(finishWrapper, 'embeddedMode')).toBe(true);

    const onClose = jest.spyOn(AbstractFinishComponent.prototype, 'onClose');
    finishWrapperComponent.close.emit();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show signing_processing on isSigning', () => {
    const { fixture, component } = getComponent();
    jest.spyOn(component, 'isSigning').mockReturnValue(true);
    fixture.detectChanges();
    const signingEl = ngMocks.find(fixture, '#signing_processing');
    expect(signingEl).toBeTruthy();
  });

  it('should show checkout-sdk-finish-status-success on isStatusSuccess', () => {
    jest.spyOn(FinishComponent.prototype, 'isStatusSuccess').mockReturnValue(true);
    jest.spyOn(FinishComponent.prototype, 'isSigning').mockReturnValue(false);
    const { fixture, component } = getComponent();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalsy();
    expect(component.nodeResult).toBeTruthy();
    const successEl = ngMocks.reveal(fixture, 'checkout-sdk-finish-status-success');
    expect(successEl).toBeTruthy();
  });


  it('should show checkout-sdk-finish-status-pending on isStatusPending', () => {
    jest.spyOn(FinishComponent.prototype, 'isStatusPending').mockReturnValue(true);
    jest.spyOn(FinishComponent.prototype, 'isSigning').mockReturnValue(false);
    const { fixture, component } = getComponent();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalsy();
    expect(component.nodeResult).toBeTruthy();
    const pendingEl = ngMocks.reveal(fixture, 'checkout-sdk-finish-status-pending');
    expect(pendingEl).toBeTruthy();
  });

  it('should show checkout-sdk-finish-status-fail on isStatusFail', () => {
    jest.spyOn(FinishComponent.prototype, 'isStatusFail').mockReturnValue(true);
    jest.spyOn(FinishComponent.prototype, 'isSigning').mockReturnValue(false);
    const { fixture, component } = getComponent();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalsy();
    expect(component.nodeResult).toBeTruthy();
    const failEl = ngMocks.reveal(fixture, 'checkout-sdk-finish-status-fail');
    expect(failEl).toBeTruthy();
  });

  it('should show checkout-sdk-finish-status-unknown on isStatusUnknown', () => {
    jest.spyOn(FinishComponent.prototype, 'isStatusUnknown').mockReturnValue(true);
    jest.spyOn(FinishComponent.prototype, 'isSigning').mockReturnValue(false);
    const { fixture, component } = getComponent();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalsy();
    expect(component.nodeResult).toBeTruthy();
    const unknownEl = ngMocks.reveal(fixture, 'checkout-sdk-finish-status-unknown');
    expect(unknownEl).toBeTruthy();
  });

});

