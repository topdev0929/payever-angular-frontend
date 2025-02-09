import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodePaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { SantanderDkApiService } from './santander-dk-api.service';

describe('SantanderDkApiService', () => {

  let service: SantanderDkApiService;
  let httpClient: HttpClient;

  const response = { response: 'all ok', code: 200 };
  const error = new Error('Failed');
  const params = {
    productId: 'product-id-test',
    duration: 300,
    frontPostBackUrl: 'https://front-post-back-url',
    applicationNumber: 'application-number-test',
    debtorId: 'debror-id-test',
    cpr: 'cpr-test',
  };
  const nodeData: NodePaymentInterface<any> = {
    payment: {
      flowId: 'flow-id-test',
      address: {
        city: 'city-test',
        country: 'country-test',
      },
      total: 3000,
      reference: 'reference-test',
    },
    paymentItems: [
      {
        identifier: 'identifier-test',
        name: 'name-test',
      },
    ],
  };
  const flowId = 'flow-id';
  const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;
  const connectionId = 'connection-id';

  let httpPost: jest.SpyInstance;
  let httpGet: jest.SpyInstance;
  let logError: jest.SpyInstance;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDkApiService,
        AbstractApiService,
      ],
    });

    service = TestBed.inject(SantanderDkApiService);
    httpClient = TestBed.inject(HttpClient);

    httpPost = jest.spyOn(httpClient, 'post');
    httpGet = jest.spyOn(httpClient, 'get');
    logError = jest.spyOn((service as any), 'logError');

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should getCreditProducts return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-products-by-connection`;

    httpPost.mockReturnValue(of(response));

    service.getCreditProducts(params, flowId, paymentMethod, connectionId).subscribe((data) => {
      expect(data).toEqual(response);
      expect(httpPost).toHaveBeenCalled();
      expect(httpPost).toHaveBeenCalledWith(expectedUrl, params);

      done();
    });

  });

  it('should getCreditProducts handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-products-by-connection`;

    httpPost.mockReturnValue(throwError(error));

    service.getCreditProducts(params, flowId, paymentMethod, connectionId).subscribe({
      error: (err) => {
        expect(err).toEqual(error);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, params);
        expect(logError).toHaveBeenCalledWith(
          err,
          flowId,
          paymentMethod,
          { url: expectedUrl, method: 'POST' },
          ApiErrorType.ErrorRates,
        );

        done();
      },
    });

  });

  it('should prepareMitIDAuthRedirect return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/prepare-application`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      amount: nodeData.payment.total,
      reference: nodeData.payment.reference,
      productId: params.productId,
      duration: params.duration,
      frontPostBackUrl: params.frontPostBackUrl,
      items: nodeData.paymentItems?.map(a => ({
        id: a.identifier,
        name: a.name,
      })),
    };

    httpPost.mockReturnValue(of(response));

    service.prepareMitIDAuthRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe((data) => {
        expect(data).toEqual(response);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);

        done();
      });

  });

  it('should prepareMitIDAuthRedirect handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/prepare-application`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      amount: nodeData.payment.total,
      reference: nodeData.payment.reference,
      productId: params.productId,
      duration: params.duration,
      frontPostBackUrl: params.frontPostBackUrl,
      items: nodeData.paymentItems?.map(a => ({
        id: a.identifier,
        name: a.name,
      })),
    };

    httpPost.mockReturnValue(throwError(error));

    service.prepareMitIDAuthRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url: expectedUrl, method: 'POST' },
          );

          done();
        },
      });

  });


  it('should prepareSkatAuthRedirect return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-skat-posturl`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      frontPostBackUrl: params.frontPostBackUrl,
    };

    httpPost.mockReturnValue(of(response));

    service.prepareSkatAuthRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe((data) => {
        expect(data).toEqual(response);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);

        done();
      });

  });

  it('should prepareSkatAuthRedirect handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-skat-posturl`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      frontPostBackUrl: params.frontPostBackUrl,
    };

    httpPost.mockReturnValue(throwError(error));

    service.prepareSkatAuthRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url: expectedUrl, method: 'POST' },
          );

          done();
        },
      });

  });

  it('should prepareBankConsentRedirect return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-bank-consent`;
    const expectedData = {
      debtorId: params.debtorId,
      returnUrl: params.frontPostBackUrl,
    };

    httpPost.mockReturnValue(of(response));

    service.prepareBankConsentRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe((data) => {
        expect(data).toEqual(response);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);

        done();
      });

  });

  it('should prepareBankConsentRedirect handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-bank-consent`;
    const expectedData = {
      debtorId: params.debtorId,
      returnUrl: params.frontPostBackUrl,
    };

    httpPost.mockReturnValue(throwError(error));

    service.prepareBankConsentRedirect(paymentMethod, connectionId, nodeData, params as any)
      .subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url: expectedUrl, method: 'POST' },
          );

          done();
        },
      });

  });

  it('should getDenmarkFormConfig return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/debtor-process-state`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
    };

    httpPost.mockReturnValue(of(response));

    service.getDenmarkFormConfig(paymentMethod, connectionId, nodeData, params as any)
      .subscribe((data) => {
        expect(data).toEqual(response);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);

        done();
      });

  });

  it('should getDenmarkFormConfig handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/debtor-process-state`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
    };

    httpPost.mockReturnValue(throwError(error));

    service.getDenmarkFormConfig(paymentMethod, connectionId, nodeData, params as any)
      .subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url: expectedUrl, method: 'POST' },
          );

          done();
        },
      });

  });

  it('should getDenmarkInsuranceConfig return data on successful response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-insurance-data`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      cpr: params.cpr,
    };

    httpPost.mockReturnValue(of(response));

    service.getDenmarkInsuranceConfig(paymentMethod, connectionId, nodeData, params as any)
      .subscribe((data) => {
        expect(data).toEqual(response);
        expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);

        done();
      });

  });

  it('should getDenmarkInsuranceConfig handle error response', (done) => {

    const expectedUrl = `${peEnvFixture().thirdParty.payments}/api/connection/${connectionId}/action/get-insurance-data`;
    const expectedData = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      cpr: params.cpr,
    };

    httpPost.mockReturnValue(throwError(error));

    service.getDenmarkInsuranceConfig(paymentMethod, connectionId, nodeData, params as any)
      .subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(httpPost).toHaveBeenCalledWith(expectedUrl, expectedData);
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url: expectedUrl, method: 'POST' },
          );

          done();
        },
      });

  });

  it('should correct get downloadQrCode', (done) => {

    const url = 'type-url';
    const type = 'type-test';
    const responseQR = 'qr-response';

    const expectedUrl = `${peEnvFixture().connect.qr}/api/download/${type}`;
    const expectedParams = new HttpParams().appendAll({ url, type });

    httpGet.mockReturnValue(of(responseQR));

    service.downloadQrCode(url, type)
      .subscribe((data) => {
        expect(data).toEqual(responseQR);
        expect(httpGet).toHaveBeenCalledWith(
          expectedUrl,
          {
            params: expectedParams,
            responseType: 'blob',
          }
        );

        done();
      });

  });

});
