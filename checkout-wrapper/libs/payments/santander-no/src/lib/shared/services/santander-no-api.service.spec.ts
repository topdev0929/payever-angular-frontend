import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { throwError } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { NodePaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';
import { NodePaymentDetailsInterface } from '../types';

import { SantanderNoApiService } from './santander-no-api.service';

describe('SantanderNoApiService', () => {
  let service: SantanderNoApiService;
  let store: Store;

  const storeHelper = new StoreHelper();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderNoApiService,
      ],
    });

    service = TestBed.inject(SantanderNoApiService);
    store = TestBed.inject(Store);
    storeHelper.setMockData();
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  
  describe('postMoreInfo', () => {
    it('should send a POST request', async () => {
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const connectionId = 'connectionId';
      const paymentId = 'paymentId';
      const nodeData = {
        payment: {},
        paymentDetails: {
          loanAmount: 10,
        },
      } as NodePaymentInterface<NodePaymentDetailsInterface>;

      const httpSpy = jest.spyOn(service['http'], 'post');

      service.postMoreInfo<unknown>(
        paymentMethod,
        connectionId,
        paymentId,
        nodeData,
      );

      expect(httpSpy).toHaveBeenCalledWith(expect.stringMatching('/api/connection/connectionId/action/more-info'), {
        ...nodeData.paymentDetails, paymentId,
      });
    });

    it('should call logError on errors', async () => {
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
      const connectionId = 'connectionId';
      const paymentId = 'paymentId';
      const nodeData = {
        payment: {
          flowId: 'flowId',
        },
        paymentDetails: {
          loanAmount: 10,
        },
      } as NodePaymentInterface<NodePaymentDetailsInterface>;

      jest.spyOn(service['http'], 'post').mockReturnValue(throwError('Error'));
      const logErrorSpy = jest.spyOn(service as any, 'logError');

      service.postMoreInfo<unknown>(
        paymentMethod,
        connectionId,
        paymentId,
        nodeData,
      ).subscribe({
        error() {
          expect(logErrorSpy).toHaveBeenCalledWith('Error', 'flowId', paymentMethod, {
            url: expect.stringMatching('/api/connection/connectionId/action/more-info'), 
            method: 'POST',
          });
        },
      });
    });
  });
});
