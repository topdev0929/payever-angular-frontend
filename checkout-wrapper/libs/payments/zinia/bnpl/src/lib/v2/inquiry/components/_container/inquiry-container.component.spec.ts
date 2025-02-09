import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { of, throwError } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  PatchFlow,
  SetFlow,
  SetPaymentError,
  SetPaymentComplete,
  ForceOpenFinishStep,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { FormValue } from '../../../models';
import { ZiniaBnplFlowService, ZiniaPaymentService } from '../../../services';
import { ZiniaBNPLInquiryModuleV2 } from '../../zinia-bnpl-inquiry.module';
import { InquiryFormComponent } from '../_form';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('zinia-bnpl-inquiry-container-v2', () => {
  let store: Store;
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let ziniaPaymentService: ZiniaPaymentService;
  let ziniaBnplFlowService: ZiniaBnplFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
            getFormOptions: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
        ZiniaPaymentService,
        ZiniaBnplFlowService,
        importProvidersFrom(ZiniaBNPLInquiryModuleV2),
        PaymentInquiryStorage,
        AddressStorageService,
      ],
      declarations: [
        MockComponents(InquiryFormComponent),
        InquiryContainerComponent,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    ziniaPaymentService = TestBed.inject(ZiniaPaymentService);
    ziniaBnplFlowService = TestBed.inject(ZiniaBnplFlowService);
    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    component.threatMetrixProcess$ = of({
      inProgress: false,
      loaded: true,
    });
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

  describe('component', () => {
    it('should return false on isPos', () => {
      expect(component.isPos).toEqual(false);
    });

    it('should call onSend on from submit', () => {
      const formData = { detailsForm: {} };
      component.onSend = jest.fn();

      const { childEl } = QueryChildByDirective(fixture, InquiryFormComponent);
      childEl.triggerEventHandler('submitted', formData);

      expect(component.onSend).toHaveBeenCalledWith(formData);
    });

    it('should triggerSubmit', () => {
      const spy = jest.spyOn(PaymentSubmissionService.prototype, 'next');
      component.triggerSubmit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSend', () => {
    it('should emit continue if has finished', () => {
      jest.spyOn(component, 'flow', 'get').mockReturnValue({ state: FlowStateEnum.FINISH });
      const updateInfo = jest.spyOn(component, 'updateInfo');
      const formData: FormValue = {
        detailsForm: {
          birthday: new Date('25/8/1991'),
          phone: '123456789',
        },
        termsForm: null,
      };
      component.onSend(formData);
      expect(updateInfo).toHaveBeenCalled();
    });

    it('should initPaymentDetails', () => {
      const flow = store.selectSnapshot(FlowState.flow);
      const dispatch = jest.spyOn(store, 'dispatch');
      const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails');
      const emitContinue = jest.spyOn(component.continue, 'next');
      const formData: FormValue = {
        detailsForm: {
          birthday: new Date('25/8/1991'),
          phone: '123456789',
        },
        termsForm: null,
      };
      component.onSend(formData);
      expect(dispatch).toHaveBeenCalledWith(new PatchFlow({
        billingAddress: {
          ...flow.billingAddress,
          phone: formData.detailsForm.phone,
        },
      }));
      expect(assignPaymentDetails).toBeCalledWith({
        birthday: formData.detailsForm.birthday,
        phone: formData.detailsForm.phone,
        customer: formData.termsForm,
      });
      expect(emitContinue).toHaveBeenCalled();
    });
  });

  describe('updateInfo', () => {
    it('should updateInfo perform correctly', () => {
      const formData = {};

      const initPaymentDetails = jest.spyOn(component as any, 'initPaymentDetails')
        .mockReturnValue(of(null));
      const preparePayment = jest.spyOn(ziniaPaymentService, 'preparePayment')
        .mockReturnValue(of(null));
      const setPaymentLoading = jest.spyOn(component['paymentHelperService'], 'setPaymentLoading')
        .mockReturnValue(null);
      const updateInfo = jest.spyOn(ziniaBnplFlowService, 'updateInfo')
        .mockReturnValue(of(null));
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));

      component.updateInfo(formData);
      expect(initPaymentDetails).toHaveBeenCalledWith(formData);
      expect(preparePayment).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
      expect(setPaymentLoading).toHaveBeenNthCalledWith(1, true);
      expect(updateInfo).toHaveBeenCalled();
      expect(dispatch).toHaveBeenNthCalledWith(1, new SetPaymentComplete());
      expect(setPaymentLoading).toHaveBeenNthCalledWith(2, false);
      expect(dispatch).toHaveBeenNthCalledWith(2, new ForceOpenFinishStep());
    });

    it('should updateInfo handle error', () => {
      const formData = {};
      const error = new Error('test error');

      const initPaymentDetails = jest.spyOn(component as any, 'initPaymentDetails')
        .mockReturnValue(of(null));
      const preparePayment = jest.spyOn(ziniaPaymentService, 'preparePayment')
        .mockReturnValue(of(null));
      const setPaymentLoading = jest.spyOn(component['paymentHelperService'], 'setPaymentLoading')
        .mockReturnValue(null);
      const updateInfo = jest.spyOn(ziniaBnplFlowService, 'updateInfo')
        .mockReturnValue(throwError(error));
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));

      component.updateInfo(formData);
      expect(initPaymentDetails).toHaveBeenCalledWith(formData);
      expect(preparePayment).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
      expect(setPaymentLoading).toHaveBeenNthCalledWith(1, true);
      expect(updateInfo).toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenNthCalledWith(1, new SetPaymentComplete());
      expect(dispatch).toHaveBeenNthCalledWith(1, new SetPaymentError(error as any));
      expect(dispatch).toHaveBeenNthCalledWith(2, new SetPaymentComplete());
      expect(setPaymentLoading).toHaveBeenNthCalledWith(2, false);
      expect(dispatch).toHaveBeenNthCalledWith(3, new ForceOpenFinishStep());
    });
  });
});

