import { Injectable } from '@angular/core';
import { DeviceUUID } from 'device-uuid';
import { DeviceDetectorService } from 'ngx-device-detector';

import { BrowserInfoInterface, DeviceInfoInterface } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OpenbankUtilsService {
  private readonly deviceUUID = new DeviceUUID();

  constructor(
    private deviceService: DeviceDetectorService,
  ) {
  }

  getDeviceInfo(): DeviceInfoInterface {
    return {
      deviceUuid: this.deviceUUID.get(),
      ...this.deviceService.isMobile()
      ? {
        mobileDeviceInfo: {
          device: this.deviceService.device,
          version: this.deviceUUID.version,
        },
      }
      : {
        webDeviceInfo: {
          version: this.deviceUUID.version,
        },
      },
    };
  }

  getBrowserInfo(): BrowserInfoInterface {
    return {
      javaEnabled: false,
      javascriptEnabled: true,
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      screenColorDepth: window.screen.colorDepth,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      timeZone: new Date().getTimezoneOffset(),
      userAgent: navigator.userAgent,
      acceptHeader: '*/*',
    };
  }
}
