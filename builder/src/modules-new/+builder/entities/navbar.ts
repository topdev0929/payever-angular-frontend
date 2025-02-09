import { PebPageType } from '@pe/builder-core';
import { ShapesElementTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
export enum WidgetPadding {
  NoPadding = 'no-padding',
  MediumPadding = 'medium-padding',
  LargePadding = 'large-padding',
}

export interface BaseWidgetSettingsInterface {
  default?: true;
  horizontalPadding?: WidgetPadding;
  widthFixed?: boolean;
}

export interface LinkInterface {
  href?: string;
  openInNewTab?: boolean;
  pageId?: string;
  text?: string;
  systemAction?: string;
}

export interface CartIconWidgetStylesInterface {
  textColor?: string;
  quantityTextColor?: string;
  quantityBackgroundColor?: string;
}

export interface NavbarPageInterface {
  /** @deprecated: Use `name` instead */
  label: string;

  uuid: string;
  name: string;
  slug: string;
  isDefault: boolean;
}

export interface NavbarSelectInterface {
  value: string;
  icon: string;
}

export enum FontWeight {
  Thin = 'thin',
  Light = 'light',
  Regular = 'regular',
  Medium = 'medium',
  Bold = 'bold',
}

export interface PageRoutingInterface {
  name: string;
  routingId: string;
}

export interface TextStylesInterface {
  fontWeight?: FontWeight;
  fontSize?: number;
}

export interface ButtonWidgetStylesInterface extends TextStylesInterface {
  textColor?: string;
  textHoverColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  borderRadius?: number;
  borderWidth?: number;
}

export interface BaseButtonWidgetSettingsInterface {
  styles?: ButtonWidgetStylesInterface;
}

// tslint:disable-next-line:no-empty-interface
export interface AmountWidgetSettingsInterface extends BaseButtonWidgetSettingsInterface {
}

export interface ButtonWidgetSettingsInterface extends BaseButtonWidgetSettingsInterface,
  BaseWidgetSettingsInterface,
  LinkInterface {
  routeIds?: string[];
  styles?: ButtonWidgetStylesInterface;
}

export interface ImageWidgetSettingsInterface {
  href?: string;
  link?: string;
  styles?: {
    width?: number;
    height?: number;
  };
}

export interface CartIconWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  showNumber?: boolean;
  styles?: CartIconWidgetStylesInterface;
}

export enum BorderCategory {
  NoBorder = 'no-border',
  Line = 'line',
}

export enum ShadowCategory {
  NoShadow = 'no-shadow',
  DropShadow = 'drop-shadow',
}

export interface ShapeWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  subtype?: ShapeWidgetSubtype;
  styles?: ShapeWidgetStylesInterface;
  borderCategory?: BorderCategory;
  shadowCategory?: ShadowCategory;
}

export enum ShapeWidgetSubtype {
  Rectangle = 'rectangle',
  RoundedRectangle = 'rounded-rectangle',
  Circle = 'circle',
}

export enum BorderStyle {
  None = 'none',
  Solid = 'solid',
  Dotted = 'dotted',
  Dashed = 'dashed',
}

export interface ShapeWidgetStylesInterface {
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  borderRadius?: number;
  borderStyle?: BorderStyle;
  borderWidth?: number;
  opacity?: number;
  boxShadowBlur?: number;
  boxShadowColor?: string;
  boxShadowOffsetY?: number;
  boxShadowOpacity?: number;
  lineHeightFieldset?: number;
}

export interface ShapeBorderInterface {
  width: number;
  color: string;
  style: BorderStyle;
}

export interface ShapeShadowInterface {
  offset: number;
  color: string;
  blur: number;
}

export interface NavbarMenuItemInterface<T = any> {
  value: T;
  label: string;
  featureFlagName?: string;
}

export enum NavbarMenuItemMediaEnum {
  Picture = 'picture',
  Video = 'video',
  Carousel = 'carousel',
}

export interface NavbarCategoryData {
  featureFlagName?: string;
  label: string;
  items: NavbarCategoryDataItem[];
}

export interface NavbarCategoryDataItem {
  featureFlagName?: string;
  value: string;
  icon?: string;
  template?: string;
  containerClass?: string;
  onClick: () => void;
  button?: {
    text: string;
    icon?: string;
  };
}
