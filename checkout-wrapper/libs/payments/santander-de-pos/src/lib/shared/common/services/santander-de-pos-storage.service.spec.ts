import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, ratesParamsFixture } from '../../../test';

import { SantanderDePosStorageService } from './santander-de-pos-storage.service';

describe('SantanderDePosStorageService', () => {
  let service: SantanderDePosStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDePosStorageService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(SantanderDePosStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('SantanderDePosStorageService', () => {
    describe('setTemporaryRateParams', () => {
      it('should set temporary rate params in flow storage', () => {
        const mockFlowId = 'mockFlowId';
        const mockParams = ratesParamsFixture();
  
        const setDataSpy = jest.spyOn(service['flowStorage'], 'setData');
  
        service.setTemporaryRateParams(mockFlowId, mockParams);
  
        expect(setDataSpy).toHaveBeenCalledWith(mockFlowId, 'temporaryRateParams', mockParams);
      });
    });
  
    describe('getTemporaryRateParams', () => {
      it('should get temporary rate params from flow storage', () => {
        const mockFlowId = 'mockFlowId';
        const mockedStoredParams = ratesParamsFixture();
  
        jest.spyOn(service['flowStorage'], 'getData').mockReturnValue(mockedStoredParams);
  
        const result = service.getTemporaryRateParams(mockFlowId);
  
        expect(result).toEqual(mockedStoredParams);
      });
  
      it('should return null if temporary rate params are not stored', () => {
        const mockFlowId = 'mockFlowId';
  
        jest.spyOn(service['flowStorage'], 'getData').mockReturnValue(null);
  
        const result = service.getTemporaryRateParams(mockFlowId);
  
        expect(result).toBeNull();
      });
    });
  });
});
