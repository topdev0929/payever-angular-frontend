import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { from, of, throwError } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import {
  FlowState,
  PatchPaymentDetails,
  PatchPaymentResponse,
  PaymentState,
  SetFlow,
  SetPaymentDetails,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  FlowInterface,
  NodePaymentAddressInterface,
  NodePaymentInterface,
  NodePaymentResponseInterface,
  NodeSwedenSSNDetails,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  PollingError,
  SalesScoringType,
} from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import {
  AuthenticationError,
  AuthenticationSigningStatus,
  NodePaymentDetailsInterface,
  SantanderSeApplicationResponse,
} from '../types';

import { SantanderSeApiService } from './santander-se-api.service';
import { SantanderSeFlowService } from './santander-se-flow.service';


describe('SantanderSeFlowService', () => {
  let instance: SantanderSeFlowService;
  let apiService: SantanderSeApiService;
  let store: Store;
  let paymentPayload: NodePaymentInterface<NodePaymentDetailsInterface>;
  let paymentResponse: NodePaymentResponseInterface<any>;
  let flow: FlowInterface;
  let paymentMethod: PaymentMethodEnum;
  const ssn = 'social-security-number';
  const amount = 1000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderSeFlowService,
        MockProvider(SantanderSeApiService),
      ],
      declarations: [],
    });
    instance = TestBed.inject(SantanderSeFlowService);
    apiService = TestBed.inject(SantanderSeApiService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse(PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_NEW,
      PaymentSpecificStatusEnum.NEED_MORE_INFO,
    )));
    store.dispatch(new SetPaymentDetails({}));
    flow = store.selectSnapshot(FlowState.flow);
    paymentPayload = store.selectSnapshot(PaymentState.paymentPayload);
    paymentResponse = store.selectSnapshot(PaymentState.response);
    paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('startMobileSigning', (done) => {
      const startMobileSigning = jest.spyOn(apiService, 'startMobileSigning')
        .mockReturnValue(of(paymentResponse));
      instance.startMobileSigning().subscribe((response) => {
        expect(response).toEqual(paymentResponse);
        done();
      });
      expect(startMobileSigning).toHaveBeenCalledWith(
        flow.id,
        paymentMethod,
        flow.connectionId,
        paymentResponse.id,
      );
    });

    it('extendAddressIfNotFilled', () => {
      const dispatch = jest.spyOn(store, 'dispatch');
      const address: NodePaymentAddressInterface = {};
      instance.extendAddressIfNotFilled(address);
      expect(dispatch).toHaveBeenCalledWith(new PatchPaymentDetails({ address }));
    });
    it('getSSNDetailsOnce and getSsnFromCache', (done) => {
      const ssnDetails: NodeSwedenSSNDetails = {
        inquiryId: 'inquiry-id',
        socialSecurityNumber: 'social-security-number',
        name: 'name',
        address: null,
        city: 'city',
        zipCode: 'zip-code',
        hasOpenApplications: false,
        salesScoringType: SalesScoringType.New,
      };
      const getSwedenSSNDetails = jest.spyOn(apiService, 'getSwedenSSNDetails')
        .mockReturnValue(of(ssnDetails));
      const saveDataToCache = jest.spyOn(instance as any, 'saveDataToCache');

      instance.getSSNDetailsOnce(ssn, amount).pipe(
        take(1),
        tap((response) => {
          expect(response).toEqual(ssnDetails);
          expect(saveDataToCache).not.toHaveBeenCalledWith(null, 'ssn');
          expect(getSwedenSSNDetails).toHaveBeenCalledWith(
            paymentMethod,
            flow.businessId,
            flow.connectionId,
            paymentPayload,
            ssn,
            amount,
          );
        }),
        switchMap(() => instance.getSsnFromCache()),
        tap((result) => {
          expect(result).toEqual(ssnDetails);
          done();
        })).subscribe();
    });

    it('should getSSNDetailsOnce get from cache', (done) => {
      const ssnDetails: NodeSwedenSSNDetails = {
        inquiryId: 'inquiry-id',
        socialSecurityNumber: 'social-security-number',
        name: 'name',
        address: null,
        city: 'city',
        zipCode: 'zip-code',
        hasOpenApplications: false,
        salesScoringType: SalesScoringType.New,
      };
      const getSwedenSSNDetails = jest.spyOn(apiService, 'getSwedenSSNDetails');
      const getDataFromCache = jest.spyOn(instance as any, 'getDataFromCache')
        .mockReturnValue(ssnDetails);

      instance.getSSNDetailsOnce(ssn, amount).pipe(
        take(1),
        tap((response) => {
          expect(response).toEqual(ssnDetails);
          expect(getDataFromCache).toHaveBeenCalledWith('ssn');
          expect(getSwedenSSNDetails).not.toHaveBeenCalled();
          done();
        })).subscribe();
    });

    it('getSSNDetailsOnce should saveDataToCache', (done) => {
      const ssnDetails: NodeSwedenSSNDetails = {
        inquiryId: 'inquiry-id',
        socialSecurityNumber: 'social-security-number',
        name: 'name',
        address: null,
        city: 'city',
        zipCode: 'zip-code',
        hasOpenApplications: false,
        salesScoringType: SalesScoringType.New,
      };
      const getSwedenSSNDetails = jest.spyOn(apiService, 'getSwedenSSNDetails')
        .mockReturnValue(of(ssnDetails));
      const saveDataToCache = jest.spyOn(instance as any, 'saveDataToCache');

      instance.getSSNDetailsOnce(ssn, amount, true).pipe(
        take(1),
        tap((response) => {
          expect(response).toEqual(ssnDetails);
          expect(saveDataToCache).toHaveBeenCalledWith(null, 'ssn');
          expect(getSwedenSSNDetails).toHaveBeenCalledWith(
            paymentMethod,
            flow.businessId,
            flow.connectionId,
            paymentPayload,
            ssn,
            amount,
          );
        }),
        switchMap(() => instance.getSsnFromCache()),
        tap((result) => {
          expect(result).toEqual(ssnDetails);
          done();
        })).subscribe();
    });

    it('getApplication and getApplicationFromCache', (done) => {
      const application: SantanderSeApplicationResponse = {
        salesScoringType: SalesScoringType.New,
      };
      const getApplication = jest.spyOn(apiService, 'getApplication')
        .mockReturnValue(of(application));
      const saveDataToCache = jest.spyOn(instance as any, 'saveDataToCache');

      instance.getApplication('inquiry-id', true).pipe(
        take(1),
        tap((response) => {
          expect(response).toEqual(application);
          expect(saveDataToCache).toHaveBeenCalledWith(null, 'application');
          expect(getApplication).toBeCalledTimes(1);
          expect(getApplication).toBeCalledWith(
            paymentMethod,
            flow.businessId,
            flow.connectionId,
            paymentPayload,
            'inquiry-id',
          );
        }),
        switchMap(() => instance.getApplicationFromCache()),
        tap((result) => {
          expect(result).toEqual(application);
          done();
        })).subscribe();
    });

    it('should getApplication return cache', (done) => {
      const application: SantanderSeApplicationResponse = {
        salesScoringType: SalesScoringType.New,
      };
      const getApplication = jest.spyOn(apiService, 'getApplication');
      const saveDataToCache = jest.spyOn(instance as any, 'saveDataToCache');
      const getDataFromCache = jest.spyOn(instance as any, 'getDataFromCache')
        .mockReturnValue(application);

      instance.getApplication('inquiry-id').pipe(
        take(1),
        tap((response) => {
          expect(response).toEqual(application);
          expect(getDataFromCache).toHaveBeenCalledWith('application');
          expect(saveDataToCache).not.toHaveBeenCalledWith(null, 'application');
          expect(getApplication).not.toHaveBeenCalled();
          done();
        })).subscribe();
    });

    it('should getApplication do not save to cache', (done) => {
      const application: SantanderSeApplicationResponse = {
        salesScoringType: SalesScoringType.New,
      };
      jest.spyOn(apiService, 'getApplication');
      jest.spyOn(instance as any, 'getDataFromCache')
        .mockReturnValue(application);
      const saveDataToCache = jest.spyOn(instance as any, 'saveDataToCache');

      instance.getApplication('inquiry-id').pipe(
        take(1),
        tap(() => {
          expect(saveDataToCache).not.toHaveBeenCalledWith(null, 'application');
          done();
        })).subscribe();
    });

    it('initiateAuthentication', (done) => {
      const transactionId = 'transaction-id';
      const initiateAuthentication = jest.spyOn(apiService, 'initiateAuthentication')
        .mockReturnValue(of({ transactionId }));
      const getAuthenticationStatus = jest.spyOn(apiService, 'getAuthenticationStatus')
        .mockReturnValue(from([
          { signingStatus: AuthenticationSigningStatus.Created },
          { signingStatus: AuthenticationSigningStatus.Created },
          { signingStatus: AuthenticationSigningStatus.Completed },
        ]));

      instance.initiateAuthentication(ssn).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual({ signingStatus: AuthenticationSigningStatus.Completed });
          done();
        }),
      ).subscribe();
      expect(initiateAuthentication).toHaveBeenCalledWith(ssn, flow.connectionId);
      expect(getAuthenticationStatus).toHaveBeenCalledWith(transactionId, flow.connectionId);
    });

    it('should initiateAuthentication handle if transactionId is null', (done) => {
      const initiateAuthentication = jest.spyOn(apiService, 'initiateAuthentication')
        .mockReturnValue(of({ transactionId: null }))
      ;
      const getAuthenticationStatus = jest.spyOn(apiService, 'getAuthenticationStatus')
        .mockReturnValue(from([
          { signingStatus: AuthenticationSigningStatus.Created },
          { signingStatus: AuthenticationSigningStatus.Created },
          { signingStatus: AuthenticationSigningStatus.Completed },
        ]));

      instance.initiateAuthentication(ssn).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual({ signingStatus: AuthenticationSigningStatus.Completed });
          done();
        }),
      ).subscribe();
      expect(initiateAuthentication).toHaveBeenCalledWith(ssn, flow.connectionId);
      expect(getAuthenticationStatus).toHaveBeenCalledWith(null, flow.connectionId);
    });

    it('isNeedMoreInfo', () => {
      expect(instance.isNeedMoreInfo(PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      ))).toBe(true);
      expect(instance.isNeedMoreInfo(PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.STATUS_PENDING,
      ))).toBe(false);
    });

    it('postMoreInfo', () => {
      const postMoreInfo = jest.spyOn(apiService, 'postMoreInfo')
        .mockReturnValue(of(paymentResponse));
      instance.postMoreInfo().subscribe();
      expect(postMoreInfo).toHaveBeenCalledWith(
        paymentMethod,
        flow.connectionId,
        paymentResponse.id,
        paymentPayload,
      );
    });

    describe('getAuthenticationStatus', () => {
      it('should handle getAuthenticationStatus', (done) => {
        const transactionId = 'transactionId';
        const connectionId = 'connectionId';
        const response = { signingStatus: AuthenticationSigningStatus.Completed };
        const getAuthenticationStatus = jest.spyOn(instance['santanderSeApiService'], 'getAuthenticationStatus')
          .mockReturnValue(of(response));

        instance['getAuthenticationStatus'](transactionId, connectionId).subscribe((status: any) => {
          expect(status).toEqual(response);
          expect(getAuthenticationStatus).toHaveBeenCalled();
          done();
        });
      });

      it('should handle default error', (done) => {
        const transactionId = 'transactionId';
        const connectionId = 'connectionId';
        const error = new Error('test error');
        jest.spyOn(instance['santanderSeApiService'], 'getAuthenticationStatus')
          .mockReturnValue(throwError(error));

        instance['getAuthenticationStatus'](transactionId, connectionId).subscribe({
          error: (err: any) => {
            expect(err).toEqual(error);
            done();
          },
        });
      });

      it('should handle polling error', (done) => {
        const transactionId = 'transactionId';
        const connectionId = 'connectionId';
        const expectedError = new AuthenticationError('signing_timeout', 'Authentication timed out!');
        jest.spyOn(instance['santanderSeApiService'], 'getAuthenticationStatus')
          .mockReturnValue(throwError(new PollingError('timeout', 'polling error')));

        instance['getAuthenticationStatus'](transactionId, connectionId).subscribe({
          error: (err: any) => {
            expect(err instanceof AuthenticationError).toBeTruthy();
            expect(err).toEqual(expectedError);
            done();
          },
        });
      });
    });
  });
});
