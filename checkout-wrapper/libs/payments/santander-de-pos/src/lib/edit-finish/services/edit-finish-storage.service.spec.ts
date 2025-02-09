import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';

import { EditFinishStorageService } from './edit-finish-storage.service';

describe('EditFinishStorageService', () => {
  let service: EditFinishStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        EditFinishStorageService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(EditFinishStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('transactionId', () => {
    it('should call getTransactionId with the correct parameters', () => {
      service.flow.id = 'mockFlowId';

      jest.spyOn(service['editTransactionStorageService'], 'getTransactionId');

      const result = service.transactionId;

      expect(service['editTransactionStorageService'].getTransactionId).toHaveBeenCalledWith(
        'mockFlowId',
        PaymentMethodEnum.SANTANDER_POS_INSTALLMENT
      );
      expect(result).toBeUndefined();
    });
  });


  describe('getEditCancelSigningRequest', () => {
    it('should return true if localStorage item is not present', () => {
      jest.spyOn(service['storage'], 'get').mockReturnValue(null);

      const result = service.getEditCancelSigningRequest();

      expect(result).toBe(true);
    });

    it('should return the parsed cancelSigningRequest value from localStorage', () => {
      const mockValue = { cancelSigningRequest: false };
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockValue));

      const result = service.getEditCancelSigningRequest();

      expect(result).toBe(false);
    });
  });


  describe('removeEditCancelSigningRequest', () => {
    it('should call localStorage.removeItem with the correct key', () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
      const mockKey = 'mockKey';

      jest.spyOn(service as any, 'makeKey').mockReturnValue(mockKey);

      service.removeEditCancelSigningRequest();

      expect(removeItemSpy).toHaveBeenCalledWith(mockKey);
    });
  });
});
