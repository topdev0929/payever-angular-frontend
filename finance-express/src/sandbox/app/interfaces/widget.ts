export type Widget = WidgetTextLink | WidgetButton | WidgetBannerAndRate | BubbleWidget;

export interface BaseWidget {
  type: WidgetType;
  link_to: WidgetLinkTo;
  show_widget_from_price: number;
  show_widget_to_price: number;
  show_widget_for_currency: string;
}

export type WidgetType = 'text_link' | 'button' | 'banner_and_rate' | 'bubble';

export type WidgetAlignment = 'left' | 'right' | 'center';

export type WidgetLinkTo = 'finance_express' | 'finance_calculator';

export interface WidgetTextLink extends BaseWidget {
  alignment: WidgetAlignment;
  height: number;
  link_color: string;
  text_size: string;
  width: number;
  adaptive_design: boolean;
}

export interface WidgetButton extends BaseWidget {
  alignment: WidgetAlignment;
  corners: WidgetButtonCorners;
  height: number;
  link_color: string;
  text_color: string;
  text_size: string;
  width: number;
  adaptive_design: boolean;
}

export type WidgetButtonCorners = 'rounded' | 'half_rounded' | 'squared';

export interface WidgetBannerAndRate extends BaseWidget {
  display_type: WidgetBannerDisplayType;
  border_color: string;
  button_color: string;
  label_placement: WidgetBannerAndRateLabelPlacement;
  link_color: string;
  size: number;
  text_color: string;
  adaptive_design: boolean;
  order: WidgetBannerRateOrder;
}

export type WidgetBannerDisplayType = 'banner_rate' | 'banner' | 'rate';

export type WidgetBannerAndRateLabelPlacement = 'bottom' | 'right' | 'left';

export interface BubbleWidget extends BaseWidget {
  visible: boolean;
}

export type WidgetBannerRateOrder = 'asc' | 'desc';
