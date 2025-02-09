import {
  CustomWidgetConfigInterface,
} from '@pe/checkout-types';

export interface ExpandedCustomWidgetConfigInterface extends CustomWidgetConfigInterface {
  quoteCallbackUrl?: string;
}
