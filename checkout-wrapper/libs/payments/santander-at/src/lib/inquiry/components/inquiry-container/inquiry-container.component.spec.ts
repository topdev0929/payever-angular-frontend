import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
    FinishDeclarationsTestHelper,
    StoreHelper,
} from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {
    const storeHelper = new StoreHelper();
    let component: InquiryContainerComponent;
    let fixture: ComponentFixture<InquiryContainerComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                AddressStorageService,
                {
                    provide: LocaleConstantsService,
                    useValue: {
                        getLang: jest.fn().mockReturnValue('de-DE'),
                    },
                },
                { provide: PaymentInquiryStorage, useValue: {} },
                { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
            ],
            declarations: [
                ...FinishDeclarationsTestHelper(),
                InquiryContainerComponent,
            ],
        }).compileComponents();

        registerLocaleData(de.default);

        storeHelper.setMockData();
        store = TestBed.inject(Store);

        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(InquiryContainerComponent);
        component = fixture.componentInstance;
        jest.useFakeTimers();

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Constructor', () => {
        it('Should check if component defined.', () => {
            expect(component).toBeDefined();
        });
    });


  describe('triggerSubmit', () => {
    it('should call onSend with empty form data', () => {
      jest.spyOn(component, 'onSend');
      component.triggerSubmit();
      expect(component.onSend).toHaveBeenCalledWith({});
    });
  });

  describe('onSend', () => {
    it('should call sendPaymentData with provided formData', () => {
      jest.spyOn(component as any, 'sendPaymentData');
      const formData = { key: 'value' };

      component.onSend(formData);

      expect(component['sendPaymentData']).toHaveBeenCalledWith(formData);
    });
  });

  describe('sendPaymentData', () => {
    it('should call setPaymentDetails on NodeFlowService and emit continue', () => {
      jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      jest.spyOn(component.continue, 'emit');

      const formData = { key: 'value' };

      component['sendPaymentData'](formData);

      expect(component['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(formData);
      expect(component.continue.emit).toHaveBeenCalled();
    });
  });
});
