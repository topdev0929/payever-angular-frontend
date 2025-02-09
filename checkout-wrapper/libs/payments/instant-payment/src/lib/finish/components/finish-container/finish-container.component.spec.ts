import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentStatusEnum } from '@pe/checkout/types';
import { CheckoutUiPaymentLogoModule } from '@pe/checkout/ui/payment-logo';

import { FinishComponent } from '../../../shared/components';
import { InstantPaymentActionEnum, PaymentService } from '../../../shared/services';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { FinishContainerStyleComponent } from '../finish-container-style/finish-container-style.component';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
  const storeHelper = new StoreHelper();
  const responseMock = {
    payment: {},
  } as NodePaymentResponseInterface<any>;

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiPaymentLogoModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        { provide: PaymentInquiryStorage, useValue: {} },
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
        FinishContainerStyleComponent,
        FinishContainerComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishContainerComponent);
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

  describe('showFinishModalFromExistingPayment', () => {
    it('should show wizard container for new payment status', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse').mockReturnValue({
        payment: { status: PaymentStatusEnum.STATUS_NEW },
        paymentDetails: { wizardSessionKey: 'testSessionKey' },
      } as NodePaymentResponseInterface<any>);

      jest.spyOn(component as any, 'showWizardContainer').mockReturnValue(of(null));
      jest.spyOn(component.cdr, 'markForCheck');

      component['showFinishModalFromExistingPayment']();

      expect(component['showWizardContainer']).toHaveBeenCalledWith('testSessionKey');
    });

    it('should call super method for non-new payment status', () => {
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse').mockReturnValue({
        payment: { status: PaymentStatusEnum.STATUS_DECLINED },
      } as any);

      const superShowFinishModalFromExistingPayment =
        jest.spyOn(AbstractFinishContainerComponent.prototype as any, 'showFinishModalFromExistingPayment');

      component['showFinishModalFromExistingPayment']();

      expect(superShowFinishModalFromExistingPayment).toHaveBeenCalled();
    });
  });

  describe('updateStatusAndContinue', () => {
    it('should update status and continue on successful payment update', (done) => {
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(of(responseMock));

      component['updateStatusAndContinue']().subscribe(() => {
        expect(component.isShowWizardContainer).toBe(false);
        expect(component.paymentResponse).toEqual(responseMock);
        expect(component.errorMessage).toBeNull();
        done();
      });
    });

    it('should handle error on payment update and set error message', (done) => {
      const errorMessage = 'Test error message';
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError({ message: errorMessage }));

      component['updateStatusAndContinue']().subscribe({
        complete: () => {
          expect(component.isShowWizardContainer).toBe(false);
          expect(component.paymentResponse).toBeNull();
          expect(component.errorMessage).toEqual(errorMessage);
          done();
        },
      });
    });
  });

  describe('showWizardContainer', () => {
    it('should show wizard container and update status on successful loading', (done) => {
      const mockElementRef: ElementRef<HTMLDivElement> = new ElementRef(document.createElement('div'));
      component.formRef = mockElementRef;

      const wizardSessionKey = 'testSessionKey';
      const load = jest.spyOn(component['instantPaymentService'], 'load')
        .mockReturnValue(of(InstantPaymentActionEnum.Finish));
      const updateStatusAndContinue = jest.spyOn(component as any, 'updateStatusAndContinue')
        .mockReturnValue(of(responseMock));


      component['showWizardContainer'](wizardSessionKey).subscribe(() => {
        expect(component.isShowWizardContainer).toBe(true);
        expect(load).toHaveBeenCalledWith();
        expect(updateStatusAndContinue).toHaveBeenCalled();

        done();
      });
    });
  });
});
