import { PeMessageBubbleLayouts, PeMessageBubbleStyle, PeMessageBubbleBrand } from '../enums';
import {  } from '../enums/message-appearance.enum';

export interface PeMessageBubble {
  showBubble?: boolean;
  showNotifications?: boolean;
  style?: PeMessageBubbleStyle;
  layout?: PeMessageBubbleLayouts;
  logo?: string;
  text?: string;
  bgColor?: string;
  textColor?: string;
  business?: string;
  _id?: string;
  __v?: number;
  brand?: PeMessageBubbleBrand;
  boxShadow?: string;
  roundedValue?: string;
  businessDocument?: PeMessageBubbleBusinessDocument;
}

export interface PeMessageBubbleBusinessDocument {
  logo?: string;
  name?: string;
}
