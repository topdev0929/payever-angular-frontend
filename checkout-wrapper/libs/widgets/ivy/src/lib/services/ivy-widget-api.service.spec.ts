import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { TokenDTO } from '../models';
import {
  connectionFixture,
  flowRequestFixture,
  flowSettingsFixture,
  paymentPayloadFixture,
} from '../test';

import { IvyWidgetApiService } from './ivy-widget-api.service';

describe('IvyWidgetApiService', () => {
  let service: IvyWidgetApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        IvyWidgetApiService,
      ],
    });

    service = TestBed.inject(IvyWidgetApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFlow', () => {
    it('should createFlow perform correctly', (done) => {
      const url = `${service['env'].backend.checkout}/api/flow/v1`;
      const payload = flowRequestFixture();
      const response = flowFixture();

      service.createFlow(payload).subscribe((flow) => {
        expect(flow).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(response);
    });
  });

  describe('getSettings', () => {
    it('should getSettings perform correctly', (done) => {
      const channelSetId = flowFixture().channelSetId;
      const url = `${service['env'].backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`;
      const response = flowSettingsFixture();

      service.getSettings(channelSetId).subscribe((settings) => {
        expect(settings).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      req.flush(response);
    });
  });

  describe('getGuestToken', () => {
    it('should getGuestToken perform correctly', (done) => {
      const url = `${service['env'].backend.auth}/api/guest-token`;
      const response: TokenDTO = {
        accessToken: 'accessToken',
      };

      service.getGuestToken().subscribe((token) => {
        expect(token).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({});

      req.flush(response);
    });
  });

  describe('getConnection', () => {
    it('should getConnection perform correctly', (done) => {
      const channelSetId = flowFixture().channelSetId;
      const url = `${service['env'].backend.checkout}/api/channel-set/${channelSetId}/default-connection/ivy`;
      const response = connectionFixture();

      service.getConnection(channelSetId).subscribe((connection) => {
        expect(connection).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      req.flush(response);
    });
  });

  describe('submitPayment', () => {
    it('should submitPayment perform correctly', (done) => {
      const connectionId = flowFixture().connectionId;
      const token = 'access-token';
      const url = `${service['env'].thirdParty.payments}/api/connection/${connectionId}/action/pay`;
      const response = {
        status: PaymentStatusEnum.STATUS_PAID,
      };

      service.submitPayment(
        connectionId,
        paymentPayloadFixture(),
        token,
      ).subscribe((paymentResponse) => {
        expect(paymentResponse).toEqual(response);

        done();
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(paymentPayloadFixture());

      req.flush(response);
    });
  });

});
