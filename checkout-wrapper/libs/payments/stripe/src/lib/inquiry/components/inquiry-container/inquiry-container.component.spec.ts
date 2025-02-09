import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { MockComponents } from 'ng-mocks';
import { ReplaySubject, of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';


import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { StripeInquiryModule } from '../../stripe-inquiry.module';
import { InquiryFormComponent } from '../inquiry-form/inquiry-form.component';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('stripe-inquiry-container', () => {
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
        importProvidersFrom(StripeInquiryModule),
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
      component.onSend = jest.fn();

      const { childEl } = QueryChildByDirective(fixture, InquiryFormComponent);
      childEl.triggerEventHandler('submitted');

      expect(component.onSend).toHaveBeenCalled();
    });

    it('should triggerSubmit', () => {
      const spy = jest.spyOn(PaymentSubmissionService.prototype, 'next');
      component.triggerSubmit();
      expect(spy).toHaveBeenCalled();
    });

    it('should emitloading on loading', () => {
      const loadingReplay$ = new ReplaySubject<boolean>();
      component.loading.subscribe(loadingReplay$);

      const { childEl } = QueryChildByDirective(fixture, InquiryFormComponent);
      childEl.triggerEventHandler('loading', false);
      childEl.triggerEventHandler('loading', true);
      childEl.triggerEventHandler('loading', false);

      expect(loadingReplay$).toBeObservable(cold('(ftf)', { f: false, t: true }));
    });

    it('should set isFinishModalShown to false on modal close ', () => {
      component.isFinishModalShown = true;
      component.onModalClose();
      expect(component.isFinishModalShown).toBe(false);
    });

    it('should emit continue if has finished', () => {
      const emitContinue = jest.spyOn(component.continue, 'emit');
      component.onSend();
      expect(emitContinue).toHaveBeenCalled();
    });
  });
});

