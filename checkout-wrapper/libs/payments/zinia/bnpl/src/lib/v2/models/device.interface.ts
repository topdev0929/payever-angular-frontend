export enum DevicePlatformEnum {
  android = 'ANDROID',
  ios = 'IOS',
}

export interface MobileDeviceInfoInterface {
  device?: string;
  osVersion?: string;
  rooted?: boolean;
  version?: string;
  platform?: DevicePlatformEnum;
}

export interface WebDeviceInfoInterface {
  version?: string;
}

export interface DeviceInfoInterface {
  deviceUuid: string;
  mobileDeviceInfo?: MobileDeviceInfoInterface;
  webDeviceInfo?: WebDeviceInfoInterface;
}
export interface BrowserInfoInterface {
  javaEnabled: boolean;
  javascriptEnabled: boolean;
  cookiesEnabled: boolean;
  language: string;
  platform: string;
  screenColorDepth: number;
  screenHeight: number;
  screenWidth: number;
  timeZone: number;
  userAgent: string;
  acceptHeader: string;
}
