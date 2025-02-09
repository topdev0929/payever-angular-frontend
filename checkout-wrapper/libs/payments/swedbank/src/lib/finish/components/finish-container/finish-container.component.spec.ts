import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, Subject, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { ExternalRedirectStorage, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, FlowState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';
import { PAYEX_HOST_VIEW } from '../../constant';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  let externalRedirectStorage: ExternalRedirectStorage;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        ExternalRedirectStorage,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    nodeFlowService = TestBed.inject(NodeFlowService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();
    jest.resetAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  describe('initEvents', () => {
    it('should initEvents perform correctly', fakeAsync(() => {
      const subject = new Subject<void>();

      const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
        .mockReturnValue(subject);
      jest.spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb) => {
          cb(1000);

          return 0;
        });

      const div = document.createElement('div');
      const querySelector = jest.spyOn(document, 'querySelector').mockReturnValue(div);

      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      (window as any).payex = {
        hostedView: {
          [PAYEX_HOST_VIEW[paymentMethod]]: jest.fn().mockReturnValue({ open: jest.fn() }),
        },
      };
      const setStyle = jest.spyOn(component['renderer'], 'setStyle');

      component['initEvents']();
      subject.next();

      expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
      expect(component.swedbankRunning).toBeTruthy();
      expect(requestAnimationFrame).toHaveBeenCalled();
      expect(querySelector).toHaveBeenCalledWith('mat-dialog-container');
      expect(setStyle).toHaveBeenCalledWith(div, 'background-color', 'white');
    }));
  });

  describe('initScript', () => {
    it('should initScript perform correctly if script and payex provided', fakeAsync(() => {
      const response = PaymentResponseWithStatus(null, null);
      const script = document.createElement('script');
      const querySelector = jest.spyOn(document, 'querySelector')
        .mockReturnValue(script);
      (window as any).payex = 'any';
      const initEvents = jest.spyOn(component as any, 'initEvents');

      component['initScript'](response);
      expect(querySelector).toHaveBeenCalledWith(`script[src="${response.paymentDetails.scriptUrl}"]`);
      tick();
      expect(initEvents).toHaveBeenCalled();
    }));

    it('should initScript create script and initEvents if script and payex is not provided', () => {
      const response = PaymentResponseWithStatus(null, null);
      const script = document.createElement('script');
      jest.spyOn(document, 'querySelector')
        .mockReturnValue(null);
      const setAttribute = jest.spyOn(component['renderer'], 'setAttribute');
      const createElement = jest.spyOn(document, 'createElement')
        .mockReturnValue(script);
      Object.defineProperty(script, 'onload', {
        set: (fn) => {
          fn();
        },
      });
      (window as any).payex = 'any';

      const initEvents = jest.spyOn(component as any, 'initEvents');
      component['initScript'](response);
      expect(createElement).toHaveBeenCalledWith('script');
      expect(setAttribute).toHaveBeenNthCalledWith(1, script, 'src', response.paymentDetails.scriptUrl);
      expect(setAttribute).toHaveBeenNthCalledWith(2, script, 'type', 'text/javascript');
      expect(setAttribute).toHaveBeenNthCalledWith(3, script, 'id', 'payment-page-script');
      expect(setAttribute).toHaveBeenNthCalledWith(4, script, 'async', 'true');
      expect(initEvents).toHaveBeenCalled();
    });
  });

  describe('paymentCallback', () => {
    it('should trigger initScript if paymentResponse is provided', (done) => {

      component.paymentResponse = PaymentResponseWithStatus(null, null);
      const initScriptSpy = jest.spyOn((component as any), 'initScript')
        .mockReturnValue(null);

      component['paymentCallback']().subscribe((result) => {
        expect(result).toBeNull();
        expect(component.paymentResponse).not.toBeUndefined();
        expect(initScriptSpy).toHaveBeenCalled();

        done();
      });

    });
  });

  describe('showFinishModalFromExistingPayment', () => {
    it('should showFinishModalFromExistingPayment trigger initScript', () => {

      const mockPaymentResponse: any = {
        payment: { status: PaymentStatusEnum.STATUS_NEW },
        paymentDetails: { scriptUrl: 'scriptUrl' },
      };

      const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(mockPaymentResponse);
      const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment');
      const initScriptSpy = jest.spyOn((component as any), 'initScript');

      component['showFinishModalFromExistingPayment']();

      expect(getFinalResponseSpy).toHaveBeenCalled();
      expect(initScriptSpy).toHaveBeenCalledWith(mockPaymentResponse);
      expect(component.paymentResponse).toEqual(mockPaymentResponse);
      expect(updatePaymentSpy).not.toHaveBeenCalled();
      expect(component.errorMessage).toBeUndefined();

    });

    it('should showFinishModalFromExistingPayment trigger update payment', () => {

      const mockPaymentResponse: any = {
        payment: { status: PaymentStatusEnum.STATUS_IN_PROCESS },
        paymentDetails: { scriptUrl: 'scriptUrl' },
      };
      const mockUpdatedPaymentResponse: any = {
        payment: { status: PaymentStatusEnum.STATUS_ACCEPTED },
        paymentDetails: { scriptUrl: 'scriptUrl-new' },
      };

      const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(mockPaymentResponse);
      const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(of(mockUpdatedPaymentResponse));
      const initScriptSpy = jest.spyOn((component as any), 'initScript');

      component['showFinishModalFromExistingPayment']();

      expect(getFinalResponseSpy).toHaveBeenCalled();
      expect(initScriptSpy).not.toHaveBeenCalledWith(mockPaymentResponse);
      expect(updatePaymentSpy).toHaveBeenCalled();
      expect(component.paymentResponse).toEqual(mockUpdatedPaymentResponse);
      expect(component.errorMessage).toBeUndefined();

    });

    it('should showFinishModalFromExistingPayment handle error', () => {

      const mockPaymentResponse: any = {
        payment: { status: PaymentStatusEnum.STATUS_IN_PROCESS },
        paymentDetails: { scriptUrl: 'scriptUrl' },
      };
      const error = new Error('Test Error');

      const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(mockPaymentResponse);
      const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(throwError(error));
      const initScriptSpy = jest.spyOn((component as any), 'initScript');

      component['showFinishModalFromExistingPayment']();

      expect(getFinalResponseSpy).toHaveBeenCalled();
      expect(initScriptSpy).not.toHaveBeenCalledWith(mockPaymentResponse);
      expect(updatePaymentSpy).toHaveBeenCalled();
      expect(component.errorMessage).toEqual(error.message);

    });

    it('should showFinishModalFromExistingPayment handle error without message', () => {

      const mockPaymentResponse: any = {
        payment: { status: PaymentStatusEnum.STATUS_IN_PROCESS },
        paymentDetails: { scriptUrl: 'scriptUrl' },
      };
      const error = new Error();

      const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(mockPaymentResponse);
      const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(throwError(error));
      const initScriptSpy = jest.spyOn((component as any), 'initScript');

      component['showFinishModalFromExistingPayment']();

      expect(getFinalResponseSpy).toHaveBeenCalled();
      expect(initScriptSpy).not.toHaveBeenCalledWith(mockPaymentResponse);
      expect(updatePaymentSpy).toHaveBeenCalled();
      expect(component.errorMessage).toEqual('Unknown error');

    });
  });

});
