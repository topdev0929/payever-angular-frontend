import { PeMessageBubbleLayouts, PeMessageBubbleStyle, PeMessageBubbleBrand } from '../enums';

export interface PeMessageBubble {
  showBubble?: boolean;
  showNotifications?: boolean;
  style?: PeMessageBubbleStyle;
  layout?: PeMessageBubbleLayouts;
  logo?: string;
  text?: string;
  blurBox?: string;
  bgColor?: string;
  textColor?: string;
  business?: string;
  businessId?: string;
  id?: string;
  _id?: string;
  __v?: number;
  brand?: PeMessageBubbleBrand;
  boxShadow?: string;
  roundedValue?: string;
  businessDocument?: PeMessageBubbleBusinessDocument;
  hidden?: boolean;
}

export interface PeMessageBubbleBusinessDocument {
  logo?: string;
  name?: string;
}
