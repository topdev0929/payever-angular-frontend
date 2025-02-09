import { Headings } from '@pe/confirmation-screen';

import { ActionTypeUIEnum } from '../enums/action-type.enum';

import { ActionTypeEnum } from './action.type';
import { ActionRequestInterface } from './detail.interface';

export interface VerifyPayloadInterface {
  data: ActionRequestInterface,
  dataKey: string,
}

export interface UIActionInterface {
  action: ActionTypeEnum;
  type: ActionTypeUIEnum;
  icon: string;
  class?: string;
  onClick?: () => void;
  label?: string;
  labelTranslated?: string;
  href?: string;
  confirmHeadings?: Headings,
  showConfirm?: boolean
  errorMessage?: string;
  isHidden?: boolean;
}

export interface BodyDataInterface {
  [key: string]: string | number | boolean | Date;
}

export interface ActionErrorInterface {
  message?: string;
}
