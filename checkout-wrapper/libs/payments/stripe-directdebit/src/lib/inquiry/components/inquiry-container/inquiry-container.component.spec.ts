import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';


import { FormInterface } from '../../../shared/types';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { StripeDirectdebitInquiryModule } from '../../stripe-directdebit-inquiry.module';
import { InquiryFormComponent } from '../inquiry-form/inquiry-form.component';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('stripe-direct-debit-inquiry-container', () => {
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
        importProvidersFrom(StripeDirectdebitInquiryModule),
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

    it('should set isFinishModalShown to false on modal close', () => {
      component.isFinishModalShown = true;
      component.onModalClose();
      expect(component.isFinishModalShown).toBe(false);
    });

    it('should emit continue if has finished', () => {
      const setPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'setPaymentDetails');
      const emitContinue = jest.spyOn(component.continue, 'emit');
      const formData: FormInterface = {
        iban: 'iban',
      };
      component.onSend(formData);
      expect(component.isSendingPayment).toBe(true);
      expect(setPaymentDetails).toHaveBeenCalledWith(formData);
      expect(emitContinue).toHaveBeenCalled();
    });
  });
});

