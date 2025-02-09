
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { of, throwError } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { FlowState, ForceOpenFinishStep, PatchFlow, SetFlow, SetPaymentComplete } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { FormValue, OpenbankFlowService, ZiniaPaymentService } from '../../../shared';
import { ZiniaInstallmentsV2ChoosePaymentModule } from '../../inquiry.module';
import { InquiryFormComponent } from '../_form';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('zinia-inquiry-container-v2', () => {
  let store: Store;
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

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
          },
        },
        importProvidersFrom(ZiniaInstallmentsV2ChoosePaymentModule),
        PaymentInquiryStorage,
        AddressStorageService,
        OpenbankFlowService,
      ],
      declarations: [
        MockComponents(InquiryFormComponent),
        InquiryContainerComponent,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
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
    describe('onSend', () => {
      const formData: FormValue = {
        detailsForm: {
          birthday: new Date('25/8/1991'),
          phone: '123456789',
        },
        termsForm: null,
        ratesForm: {
          duration: 128,
          interest: 207,
        },
      };

      it('should emit continue if has finished', () => {
        const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails')
          .mockImplementation(() => of(null));
        const preparePayment = jest.spyOn(ZiniaPaymentService.prototype, 'preparePayment')
          .mockReturnValue(of({
            successUrl: 'successUrl',
            cancelUrl: 'cancelUrl',
            failureUrl: 'failureUrl',
          }));
        const updateInfo = jest.spyOn(OpenbankFlowService.prototype, 'updateInfo')
          .mockReturnValue(of(null));
        jest.spyOn(component, 'flow', 'get').mockReturnValue({ state: FlowStateEnum.FINISH });
        const dispatch = jest.spyOn(store, 'dispatch');
        component.onSend(formData);
        expect(assignPaymentDetails).toHaveBeenCalled();
        expect(preparePayment).toHaveBeenCalled();
        expect(updateInfo).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(new ForceOpenFinishStep());
      });

      it('should emit continue if has finished with error on updateInfo', () => {
        const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails')
          .mockImplementation(() => of(null));
        const preparePayment = jest.spyOn(ZiniaPaymentService.prototype, 'preparePayment')
          .mockReturnValue(of({
            successUrl: 'successUrl',
            cancelUrl: 'cancelUrl',
            failureUrl: 'failureUrl',
          }));
        const updateInfo = jest.spyOn(OpenbankFlowService.prototype, 'updateInfo')
          .mockReturnValue(throwError('error'));
        jest.spyOn(component, 'flow', 'get').mockReturnValue({ state: FlowStateEnum.FINISH });
        const dispatch = jest.spyOn(store, 'dispatch');
        component.onSend(formData);
        expect(assignPaymentDetails).toHaveBeenCalled();
        expect(preparePayment).toHaveBeenCalled();
        expect(updateInfo).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(new SetPaymentComplete());
        expect(dispatch).toHaveBeenCalledWith(new ForceOpenFinishStep());
      });

      it('should emit continue if doesn\'t have finished', () => {
        const flow = store.selectSnapshot(FlowState.flow);
        const dispatch = jest.spyOn(store, 'dispatch');
        const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails');
        const emitContinue = jest.spyOn(component.continue, 'next');

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
          duration: 128,
          interest: 207,
        });
        expect(emitContinue).toHaveBeenCalled();
      });

    });
  });
});

