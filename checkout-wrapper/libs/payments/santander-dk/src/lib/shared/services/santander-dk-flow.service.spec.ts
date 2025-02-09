import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  NodeAuthMitIDParams,
  NodeAuthMitIDRedirectData,
  NodeAuthSkatParams,
  NodeAuthSkatRedirectData,
  NodeBankConsentParams,
  NodeBankConsentRedirectData,
  NodeDenmarkFormConfigData,
  NodeDenmarkInsuranceConfigData,
  NodeDenmarkInsuranceConfigParams,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentPayload } from '../../test';
import { SharedModule } from '../shared.module';

import { SantanderDkApiService } from './santander-dk-api.service';
import { SantanderDkFlowService } from './santander-dk-flow.service';

describe('SantanderDkFlowService', () => {

  let service: SantanderDkFlowService;

  let store: Store;
  let santanderDkApiService: SantanderDkApiService;

  const flowId = flowWithPaymentOptionsFixture().id;
  const connectionId = flowWithPaymentOptionsFixture().connectionId;
  const paymentMethod = flowWithPaymentOptionsFixture().paymentOptions[0].paymentMethod;

  const denmarkConfigParams: NodeDenmarkInsuranceConfigParams = {
    applicationNumber: 'application-number',
    debtorId: 'debtor-id',
    cpr: 'cpr',
  };

  const insuranceConfigData: NodeDenmarkInsuranceConfigData = {
    insuranceEnabled: false,
    insuranceMonthlyCost: 1000,
    insurancePercent: 10,
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    santanderDkApiService = TestBed.inject(SantanderDkApiService);

    service = TestBed.inject(SantanderDkFlowService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should correctly call getCreditProducts', (done) => {

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'getCreditProducts')
      .mockReturnValue(of(insuranceConfigData));

    service.getCreditProducts(denmarkConfigParams).subscribe((data) => {
      expect(data).toEqual(insuranceConfigData);

      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(denmarkConfigParams, flowId, paymentMethod, connectionId);

      done();
    });

  });

  it('should correctly call prepareMitIDAuthRedirect', (done) => {

    const authMitIDRedirectData: NodeAuthMitIDRedirectData = {
      applicationNumber: 'application-number',
      redirectUrl: 'test-redirect-url',
    };

    const authMitIDParams: NodeAuthMitIDParams = {
      productId: 1,
      duration: 12,
      frontPostBackUrl: 'test-front-post-back-url',
    };

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'prepareMitIDAuthRedirect')
      .mockReturnValue(of(authMitIDRedirectData));

    service.prepareMitIDAuthRedirect(authMitIDParams).subscribe((data) => {
      expect(data).toEqual(authMitIDRedirectData);

      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(paymentMethod, connectionId, paymentPayload(), authMitIDParams);

      done();
    });

  });

  it('should correctly call prepareSkatAuthRedirect', (done) => {

    const authSkatParams: NodeAuthSkatParams = {
      applicationNumber: 'applicationNumber',
      debtorId: 'debtorId',
      frontPostBackUrl: 'frontPostBackUrl',
    };
    const authSkatRedirectData: NodeAuthSkatRedirectData = {
      postUrl: 'test-post-url',
      postValues: [{ key: 'key', value: '0' }],
    };

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'prepareSkatAuthRedirect')
      .mockReturnValue(of(authSkatRedirectData));

    service.prepareSkatAuthRedirect(authSkatParams).subscribe((data) => {
      expect(data).toEqual(authSkatRedirectData);
      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(paymentMethod, connectionId, paymentPayload(), authSkatParams);

      done();
    });

  });

  it('should correctly call prepareBankConsentRedirect', (done) => {

    const bankConsentRedirectData: NodeBankConsentRedirectData = {
      url: 'test-url',
    };

    const bankConsentParams: NodeBankConsentParams = {
      debtorId: 'debtorId',
      frontPostBackUrl: 'frontPostBackUrl',
      consentSuccess: true,
    };

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'prepareBankConsentRedirect')
      .mockReturnValue(of(bankConsentRedirectData));

    service.prepareBankConsentRedirect(bankConsentParams).subscribe((data) => {
      expect(data).toEqual(bankConsentRedirectData);
      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(paymentMethod, connectionId, paymentPayload(), bankConsentParams);

      done();
    });

  });

  it('should correctly call getFormConfig', (done) => {

    const denmarkFormConfigData: NodeDenmarkFormConfigData = {
      cprProcess: true,
      taxProcess: true,
    };

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'getDenmarkFormConfig')
      .mockReturnValue(of(denmarkFormConfigData));

    service.getFormConfig(denmarkConfigParams).subscribe((data) => {
      expect(data).toEqual(denmarkFormConfigData);

      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(paymentMethod, connectionId, paymentPayload(), denmarkConfigParams);

      done();
    });

  });

  it('should correctly call getInsuranceConfig', (done) => {

    const santanderDkApiServiceSpy = jest.spyOn(santanderDkApiService, 'getDenmarkInsuranceConfig')
      .mockReturnValue(of(insuranceConfigData));

    service.getInsuranceConfig(denmarkConfigParams).subscribe((data) => {
      expect(data).toEqual(insuranceConfigData);

      expect(santanderDkApiServiceSpy).toHaveBeenCalledTimes(1);
      expect(santanderDkApiServiceSpy)
        .toHaveBeenCalledWith(paymentMethod, connectionId, paymentPayload(), denmarkConfigParams);

      done();
    });

  });

});
