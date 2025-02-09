import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  PatchFlow,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { FormValue } from '../../../models';
import { ZiniaBNPLInquiryModuleV3 } from '../../zinia-bnpl-inquiry.module';
import { InquiryFormComponent } from '../_form';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('zinia-bnpl-inquiry-container-v3', () => {
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
        importProvidersFrom(ZiniaBNPLInquiryModuleV3),
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
    it('Should show errorMessages', async () => {
      component.errorMessage = 'Oops!';
      component.cdr.detectChanges();

      const p = fixture.debugElement.query(By.css('p'))?.nativeElement;
      expect(p).toBeTruthy();
      expect(p.innerHTML).toEqual(component.errorMessage);
    });

    it('should call onSend on from submit', () => {
      const formData = { detailsForm: {} };
      component.onSend = jest.fn();

      const { childEl } = QueryChildByDirective(fixture, InquiryFormComponent);
      childEl.triggerEventHandler('submitted', formData);

      expect(component.onSend).toHaveBeenCalledWith(formData);
    });

    it('Should check finish status on isFlowHasFinishedPayment', () => {
      const apiService = TestBed.inject(ApiService);
      jest.spyOn(apiService, '_patchFlow')
        .mockImplementation((_, data) => of(data));

      expect(component.isFlowHasFinishedPayment()).toBe(false);

      jest.spyOn(component, 'flow', 'get').mockReturnValue({ state: FlowStateEnum.FINISH });
      fixture.detectChanges();

      expect(component.isFlowHasFinishedPayment()).toBe(true);
    });

    it('should triggerSubmit', () => {
      const spy = jest.spyOn(PaymentSubmissionService.prototype, 'next');
      component.triggerSubmit();
      expect(spy).toHaveBeenCalled();
    });
    describe('onSend', () => {
      it('should emit continue if has finished', () => {
        jest.spyOn(component, 'flow', 'get').mockReturnValue({ state: FlowStateEnum.FINISH });
        const emitContinue = jest.spyOn(component.continue, 'next');
        component.onSend(null);
        expect(emitContinue).toHaveBeenCalled();
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
  });
});

