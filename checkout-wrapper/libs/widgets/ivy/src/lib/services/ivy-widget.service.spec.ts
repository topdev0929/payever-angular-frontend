import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import {
  CustomWidgetConfigInterface,
  FlowInterface,
  PaymentPayload,
} from '@pe/checkout/types';

import {
  connectionFixture,
  flowRequestFixture,
  flowSettingsFixture, paymentPayloadFixture,
  widgetConfigFixture,
} from '../test';

import { IvyWidgetApiService } from './ivy-widget-api.service';
import { IvyWidgetService } from './ivy-widget.service';

describe('IvyWidgetService', () => {
  let service: IvyWidgetService;
  let api: IvyWidgetApiService;

  const flow = {
    ...flowFixture(),
    guestToken: 'mock-guest-token',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...CommonProvidersTestHelper(),
        IvyWidgetService,
        IvyWidgetApiService,
      ],
    });

    service = TestBed.inject(IvyWidgetService);
    api = TestBed.inject(IvyWidgetApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFlow', () => {
    it('should create flow', (done) => {
      jest.spyOn(api, 'createFlow').mockReturnValue(of(flow));

      service.createFlow(flowRequestFixture()).subscribe((flow) => {
        expect(flow).toEqual(flow);
        expect(api.createFlow).toHaveBeenCalledWith(flowRequestFixture());
        expect(service.token).toEqual(flow.guestToken);
        done();
      });
    });
  });

  describe('getSettings', () => {
    const channelSetId = flow.channelSetId;

    it('should get settings', (done) => {
      jest.spyOn(api, 'getSettings').mockReturnValue(of(flowSettingsFixture()));

      service.getSettings(channelSetId).subscribe((settings) => {
        expect(settings).toEqual(flowSettingsFixture());
        expect(api.getSettings).toHaveBeenCalledWith(channelSetId);
        done();
      });
    });
  });

  describe('getConnection', () => {
    const channelSetId = flow.channelSetId;

    it('should get connection', (done) => {
      jest.spyOn(api, 'getConnection').mockReturnValue(of(connectionFixture()));

      service.getConnection(channelSetId).subscribe((connection) => {
        expect(connection).toEqual(connectionFixture());
        expect(api.getConnection).toHaveBeenCalledWith(channelSetId);
        done();
      });
    });
  });

  describe('submitPayment', () => {
    const connectionId = flow.connectionId;
    const amount = flow.amount;
    const channelSetId = flow.channelSetId;
    const settings = flowSettingsFixture();
    const config = widgetConfigFixture();
    const cart = flowRequestFixture().cart;

    beforeEach(() => {
      jest.spyOn(api, 'submitPayment').mockReturnValue(of(null));

      service.token = flow.guestToken;
    });

    it('should submit payment', (done) => {
      service.submitPayment(
        flow,
        connectionId,
        amount,
        channelSetId,
        settings,
        config,
        cart,
      ).subscribe(() => {
        expect(api.submitPayment).toHaveBeenCalledWith(connectionId, paymentPayloadFixture(), flow.guestToken);

        done();
      });
    });

    it('should submit payment handle branch', (done) => {
      const configBranch: CustomWidgetConfigInterface = {
        ...config,
        cart,
        shippingOption: undefined,
        cancelUrl: undefined,
      };
      const flowBranch: FlowInterface = {
        ...flow,
        apiCall: undefined,
      };

      const payload: PaymentPayload = {
        payment: {
          ...paymentPayloadFixture().payment,
          deliveryFee: 0,
          reference: configBranch.reference,
          total: amount,
          billingAddress: configBranch.billingAddress,
          shippingAddress: configBranch.shippingAddress,
          shippingOption: configBranch.shippingOption,
          apiCallId: flowBranch.apiCall?.id,
        },
        paymentDetails: {
          ...paymentPayloadFixture().paymentDetails,
          frontendFailureUrl: window.location.href,
          frontendCancelUrl: configBranch.failureUrl,
        },
        paymentItems: configBranch.cart,
      };

      service.submitPayment(
        flowBranch,
        connectionId,
        amount,
        channelSetId,
        settings,
        configBranch,
        null,
      ).subscribe(() => {
        expect(api.submitPayment).toHaveBeenCalledWith(connectionId, payload, flow.guestToken);

        done();
      });
    });
  });

});
