import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { ApiService, ChannelSetDeviceSettingsInterface, VerificationTypeEnum } from '@pe/checkout/api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { PaymentExternalCodeInterface } from '@pe/checkout/types';

import { ExternalCodeService } from './external-code.service';

describe('ExternalCodeService', () => {
  let service: ExternalCodeService;
  let apiService: ApiService;
  let store: Store;

  const paymentExternalCode: PaymentExternalCodeInterface = {
    _id: 'code-id',
    checkoutId: 'checkout-id',
    code: 'code',
    terminalId: 'terminal-id',
    status: 'status',
    flow: flowFixture(),
  };
  const channelSetDeviceSettings: ChannelSetDeviceSettingsInterface = {
    autoresponderEnabled: false,
    enabled: true,
    secondFactor: false,
    verificationType: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper(), ExternalCodeService, ApiService],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowFixture()));

    apiService = TestBed.inject(ApiService);
    service = TestBed.inject(ExternalCodeService);

    jest.spyOn(apiService, 'getPaymentExternalCodeByFlowId').mockReturnValue(of(paymentExternalCode));
    jest.spyOn(apiService, 'getChannelSetDeviceSettings').mockReturnValue(of(channelSetDeviceSettings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('ViewModel', () => {
    it('should get ViewModel', (done) => {
      service.getViewModel(flowFixture().id, null, null).subscribe((vm) => {
        expect(vm).toMatchObject({
          codeData: paymentExternalCode,
          secondFactor: channelSetDeviceSettings.secondFactor,
          verificationType: channelSetDeviceSettings.verificationType,
        });
        done();
      });
    });

    it('should get ViewModel with provided second factor and verification type', (done) => {
      service.getViewModel(flowFixture().id, true, VerificationTypeEnum.VERIFY_BY_ID).subscribe((vm) => {
        expect(vm).toMatchObject({
          codeData: paymentExternalCode,
          secondFactor: true,
          verificationType: VerificationTypeEnum.VERIFY_BY_ID,
        });
        done();
      });
    });
  });
});
