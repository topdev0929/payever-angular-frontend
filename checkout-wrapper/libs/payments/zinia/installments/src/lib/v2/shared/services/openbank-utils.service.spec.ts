
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { DeviceDetectorService } from 'ngx-device-detector';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';


import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { OpenbankUtilsService } from './openbank-utils.service';

describe('OpenbankUtilsService', () => {
  let store: Store;

  let instance: OpenbankUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        OpenbankUtilsService,
        DeviceDetectorService,
      ],
    });
    instance = TestBed.inject(OpenbankUtilsService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('getDeviceInfo', () => {
      const isMobile = jest.spyOn(DeviceDetectorService.prototype, 'isMobile')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      let deviceInfo = instance.getDeviceInfo();
      expect(deviceInfo?.deviceUuid).toBeTruthy();
      expect(deviceInfo?.webDeviceInfo?.version).toBeTruthy();
      deviceInfo = instance.getDeviceInfo();
      expect(deviceInfo?.deviceUuid).toBeTruthy();
      expect(deviceInfo?.mobileDeviceInfo?.version).toBeTruthy();
      expect(deviceInfo?.mobileDeviceInfo?.device).toBeTruthy();
      expect(isMobile).toHaveBeenCalledTimes(2);
    });

    it('getBrowserInfo', () => {
      const n: Partial<typeof navigator> = {
        platform: 'Linux x86_64',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0',
        language: 'en-US',
        cookieEnabled: true,
      };
      Object.entries(n).forEach(([key, value]) => {
        jest.spyOn(navigator, key as keyof typeof n, 'get').mockReturnValue(value);
      });
      const browserInfo = instance.getBrowserInfo();
      expect(browserInfo).toBeTruthy();
      expect(browserInfo).toMatchObject({
        cookiesEnabled: n.cookieEnabled,
        language: n.language,
        platform: n.platform,
        userAgent: n.userAgent,
        javaEnabled: false,
      });
      expect(browserInfo.screenWidth).not.toBeNull();
      expect(browserInfo.screenHeight).not.toBeNull();
      expect(browserInfo.screenColorDepth).not.toBeNull();
    });
  });
});

