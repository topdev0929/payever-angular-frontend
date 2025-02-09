import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;
  let nodeFlowService: NodeFlowService;
  let externalRedirectStorage: ExternalRedirectStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        PaymentService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postPayment', () => {
    it('should handle successful postPayment', (done) => {
      const mockPaymentResponse = {
        paymentDetails: { redirectUrl: 'mockRedirectUrl' },
      } as NodePaymentResponseInterface<any>;

      const topLocationService = TestBed.inject(TopLocationService);

      jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      jest.spyOn(service as any, 'preparePayment').mockReturnValue(of(undefined));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));

      service.postPayment().subscribe(() => {

        expect(nodeFlowService.postPayment).toHaveBeenCalled();
        expect(externalRedirectStorage.saveDataBeforeRedirect).toHaveBeenCalledWith(service['flow']);
        done();
      });
    });

    it('should throw an error if "redirectUrl" is empty in the backend response', (done) => {
      const mockPaymentResponse = {
        paymentDetails: { redirectUrl: '' },
      } as NodePaymentResponseInterface<any>;

      jest.spyOn(service as any, 'preparePayment').mockReturnValue(of(undefined));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));

      service.postPayment().subscribe(
        jest.fn(),
        (error) => {
          expect(error).toEqual(new Error('The "redirectUrl" is empty in backend response'));
          done();
        }
      );
    });
  });

  describe('preparePayment', () => {
    it('should set payment details and call setPaymentDetails on NodeFlowService', (done) => {
      const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
      const flowId = flowWithPaymentOptionsFixture().id;
      const frontendFinishUrl = new URL(`${checkoutWrapper}/en/pay/${flowId}/redirect-to-payment`);
      const frontendCancelUrl = new URL(`${checkoutWrapper}/en/pay/${flowId}/redirect-to-choose-payment`);
      const mockNodePaymentDetails = {
        frontendFinishUrl: frontendFinishUrl.toString(),
        frontendCancelUrl: frontendCancelUrl.toString(),
      };

      const localeConstantsService = TestBed.inject(LocaleConstantsService);

      jest.spyOn(localeConstantsService, 'getLang').mockReturnValue('en');
      jest.spyOn(nodeFlowService, 'setPaymentDetails');

      service['preparePayment']().subscribe({
        next: () => {
          done();
          expect(service['env'].frontend.checkoutWrapper).toBeDefined();
          expect(service['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(mockNodePaymentDetails);
        },
      });
    });
  });
});
