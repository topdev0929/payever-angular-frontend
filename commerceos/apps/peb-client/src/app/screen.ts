import { PEB_ROOT_SCREEN_KEY, PebScreenEnum } from '@pe/builder/core';

export const getUserAgentScreen = (userAgent: string | undefined): PebScreenEnum => {
  if (!userAgent) {
    return PEB_ROOT_SCREEN_KEY;
  }
  if (isMobileDevice(userAgent)) {
    return PebScreenEnum.Mobile;
  }
  if (isTabletDevice(userAgent)) {
    return PebScreenEnum.Tablet;
  }

  return PebScreenEnum.Desktop;
}

const isMobileDevice = (userAgent: string): boolean => {
  const regex = [/(Android)(.+)(Mobile)/i, /BlackBerry/i, /iPhone|iPod/i, /Opera Mini/i, /IEMobile/i];

  return regex.some(re => re.exec(userAgent));
};

const isTabletDevice = (userAgent: string): boolean => {
  const patterns = [
    'ipad',
    'tablet',
    'android(?!.*mobile)',
    'windows(?!.*phone)(.*touch)',
    'kindle',
    'playbook',
    'silk',
    'puffin(?!.*(IP|AP|WP))',
  ]
  const regex = new RegExp(patterns.join('|'), 'i');

  return regex.test(userAgent.toLowerCase());
};
