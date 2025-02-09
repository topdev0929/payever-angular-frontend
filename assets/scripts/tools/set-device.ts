import { changeInnerHtml } from '../common/index';
import { stepsInit } from '../steps';

export const setDevice = (device : DeviceType = 'desktop'): void => {
  document.body.classList.toggle('mobile', device === 'mobile');
  changeInnerHtml('device-label', device);
  stepsInit(device, true);
};

export type DeviceType = 'desktop' | 'mobile';

