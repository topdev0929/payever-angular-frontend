import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { ABSTRACT_PAYMENT_SERVICE, AbstractContainerComponent } from '@pe/checkout/payment';
import { StorageModule } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, NodeShopUrlsInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils/src';

import { flowWithPaymentOptionsFixture } from '../../test';
import { TYPE_CREDIT_Z } from '../constants';
import { PaymentService } from '../services';
import { NodePaymentDetailsResponseInterface } from '../types';

import { BaseContainerComponent } from './base-container.component';


@Component({
  selector: 'extends-base-container-component',
  template: '<div></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExtendsBaseContainerComponent extends BaseContainerComponent implements OnInit {
  ngOnInit(): void {
    super.ngOnInit();
  }
}

describe('BaseContainerComponent', () => {
  let fixture: ComponentFixture<ExtendsBaseContainerComponent>;
  let component: ExtendsBaseContainerComponent;

  let store: Store;
  let localeConstantService: LocaleConstantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        StorageModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        LocaleConstantsService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
      declarations: [
        ExtendsBaseContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    localeConstantService = TestBed.inject(LocaleConstantsService);
    fixture = TestBed.createComponent(ExtendsBaseContainerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof AbstractContainerComponent).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit and set nodeResult and initPaymentMethod', () => {
      const mockFinalResponse = {
        payment: {},
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;
      const getFinalResponseSpy = jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(mockFinalResponse);
      const initPaymentMethodSpy = jest.spyOn(component['analyticsFormService'], 'initPaymentMethod');

      component.ngOnInit();

      expect(initPaymentMethodSpy).toHaveBeenCalled();
      expect(getFinalResponseSpy).toHaveBeenCalled();
      expect(component.nodeResult).toEqual(mockFinalResponse);
    });
  });

  describe('Getter', () => {
    it('should isPos return false', () => {
      expect(component.paymentMethod).not.toEqual(PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO);
      expect(component.isPos).toBeFalsy();
    });
    it('should getPaymentUrl return null', () => {
      expect(component['getPaymentUrl']()).toBeNull();
    });
    it('should onPostPaymentSuccess return nothing', () => {
      expect(component['onPostPaymentSuccess']()).toBeUndefined();
    });
  });

  describe('isNeedMoreInfo', () => {
    it('should call nodeFlowService methods and preparePayment', () => {
      const isNeedMoreInfoSpy = jest.spyOn(component['santanderNoFlowService'], 'isNeedMoreInfo')
        .mockReturnValue(true);

      expect(component.isNeedMoreInfo()).toBe(true);
      expect(isNeedMoreInfoSpy).toHaveBeenCalledWith(component.nodeResult);
    });
  });

  describe('sendPaymentData', () => {
    it('should call nodeFlowService methods and preparePayment', fakeAsync(() => {
      const formData = {};
      const preparePaymentSpy = jest.spyOn(component as any, 'preparePayment');
      const assignPaymentDetailsSpy = jest.spyOn(component['nodeFlowService'], 'assignPaymentDetails');
      const setPaymentDetailsSpy = jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');

      fixture.detectChanges();

      component['sendPaymentData'](formData).subscribe();

      tick();

      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({});
      expect(setPaymentDetailsSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(preparePaymentSpy).toHaveBeenCalled();

    }));

    it('should throw an error', () => {
      fixture.detectChanges();

      jest.spyOn(component as any, 'paymentOption', 'get').mockReturnValue(null);

      expect(() => component['sendPaymentData']({})).toThrowError('Payment method not presented in list!');
    });
  });

  describe('preparePayment', () => {

    it('should call nodeApiService.getShopUrls with the correct flow', fakeAsync(() => {
      const getShopUrlsSpy = jest.spyOn(component['nodeApiService'], 'getShopUrls');

      component['preparePayment']().subscribe();

      tick();

      expect(getShopUrlsSpy).toHaveBeenCalledWith(component.flow);
    }));

    it('should update payment details using nodeFlowService', (done) => {

      const locale = 'en';
      const wrapperUrl = 'http://localhost:8090';
      const flowId = flowWithPaymentOptionsFixture().id;

      const shopUrls = {
        successUrl: 'someSuccessUrl',
        failureUrl: 'someFailureUrl',
        cancelUrl: 'someCancelUrl',
      };

      jest.spyOn(localeConstantService, 'getLang')
        .mockReturnValue(locale);
      jest.spyOn(component['nodeApiService'], 'getShopUrls')
        .mockReturnValue(of(shopUrls));
      const assignPaymentDetailsSpy = jest.spyOn(component['nodeFlowService'], 'assignPaymentDetails');

      const url = new URL(`${wrapperUrl}/${locale}/pay/${flowId}/redirect-to-payment`);
      url.searchParams.set('type', TYPE_CREDIT_Z);
      url.searchParams.set('guest_token', 'undefined');


      component['preparePayment']().subscribe(() => {
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({
          frontendSuccessUrl: shopUrls.successUrl,
          frontendCustomerApprovalApprovedUrl: url,
          frontendFailureUrl: shopUrls.failureUrl,
          frontendCustomerApprovalManualUrl: url,
          frontendCancelUrl: shopUrls.cancelUrl,
          frontendCustomerApprovalDeclinedUrl: url,
        });

        done();
      });
    });

    it('should update payment details using nodeFlowService without shopUrls', (done) => {

      const locale = 'en';
      const wrapperUrl = 'http://localhost:8090';
      const flowId = flowWithPaymentOptionsFixture().id;

      const shopUrls: NodeShopUrlsInterface = {
        successUrl: null,
        failureUrl: null,
        cancelUrl: null,
      };

      jest.spyOn(localeConstantService, 'getLang').mockReturnValue(locale);
      jest.spyOn(component['nodeApiService'], 'getShopUrls').mockReturnValue(of(shopUrls));


      const assignPaymentDetailsSpy = jest.spyOn(component['nodeFlowService'], 'assignPaymentDetails');
      const url = new URL(`${wrapperUrl}/${locale}/pay/${flowId}/redirect-to-payment`);
      url.searchParams.set('type', TYPE_CREDIT_Z);
      url.searchParams.set('guest_token', 'undefined');

      component['preparePayment']().subscribe(() => {
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({
          frontendSuccessUrl: `${wrapperUrl}/${locale}/pay/${flowId}/static-finish/success`,
          frontendCustomerApprovalApprovedUrl: url,
          frontendFailureUrl: `${wrapperUrl}/${locale}/pay/${flowId}/static-finish/fail`,
          frontendCustomerApprovalManualUrl: url,
          frontendCancelUrl: `${wrapperUrl}/${locale}/pay/${flowId}/static-finish/cancel`,
          frontendCustomerApprovalDeclinedUrl: url,
        });

        done();
      });
    });
  });
});

