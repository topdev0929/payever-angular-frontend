import { Immutable } from 'immer';

import { AppType } from '@pe/common';

import { PebScriptTrigger } from '../constants';

import { PebAnimation } from './animation.model';
import { PebBorder } from './border.model';
import { PebCursorMode } from './cursor.model';
import { PebDesign } from './design.model';
import { PebDimension } from './dimension.model';
import {
  PebElementType,
  PebMap,
  PebValueByScreen,
  PebViewStyle,
  PebViewVector,
} from './element.model';
import { PebFill } from './fill.model';
import { PebElementFilter } from './filter.model';
import { PebIntegration } from './integration.model';
import { PebInteraction } from './interaction.model';
import { PebPage, PebScreen, PebTheme } from './interfaces';
import { PebLanguage } from './language.model';
import { PebLayout, PebOverflowMode } from './layout.model';
import { PebLink } from './link.model';
import { PebAbsoluteBound, PebLayoutPosition, PebPadding, PebPosition } from './position.model';
import { PebSBoxShadow } from './shadow.model';
import { PebTextStyles } from './text.model';
import { PebViewPage, PebViewQueryModel } from './view-state.model';

export interface PebElementStyles {
  opacity?: number;
  display?: string;
  position?: PebPosition;
  dimension?: PebDimension;
  layoutPosition?: PebLayoutPosition;
  padding?: PebPadding;
  layout?: PebLayout;
  visibility?: string;
  objectFit?: string;

  alignItems?: string;
  border?: PebBorder;
  borderRadius?: string | number;
  filter?: PebElementFilter;
  fontSize?: number;

  /** @deprecated */
  gridArea?: string;

  gridTemplateColumns?: number[];
  gridTemplateRows?: number[];
  color?: string;
  shadow?: PebSBoxShadow;

  order?: number;
  fill?: PebFill;
  cursor?: PebCursorMode;

  overflow?: PebOverflowMode;

  /** @deprecated */
  mediaType?: any;
  zIndex?: number;

  textStyles?: Partial<PebTextStyles>;

  absoluteBound?: PebAbsoluteBound;
}

export enum PebPageType {
  Master = 'master',
  Replica = 'replica',
}

export enum PebPageVariant {
  Front = 'front',
  Default = 'default',
  Category = 'category',
  Product = 'product',
  NotFound = '404',
  Login = 'login',
  Password = 'password',
  Partial = 'partial',
}

export enum PebRestrictType {
  All = 'all',
  Groups = 'groups',
  Customers = 'customers',
  Password = 'password',
}

export interface PebRestrictAccess {
  type: PebRestrictType | string;
  customers?: string[];
  groups?: string[];
  password?: string;
}

export interface PebPageSeo {
  description: string;
  showInSearchResults: boolean;
  canonicalUrl: string;
  markupData: string;
  customMetaTags: string;
}

export interface PebShopDataLanguage {
  language: PebLanguage;
  active: boolean;
}

export interface PebScript {
  id: string;
  page: string
  name: string;
  content: string;
  isEnable: boolean;  
  triggerPoint: PebScriptTrigger;
  deleted: boolean;
  versionNumber: number;
  type?: string;
  needPermission?: boolean;
}

export interface PebShop {
  id: string;
  data: any;
  pages: PebPage[];
}

export interface PebClientElementDef {
  visible: boolean;
  style: PebViewStyle,  
  fill?: PebFill;
  vector?: PebViewVector;
  pebStyles: Partial<PebElementStyles>;
}

export interface PebClientElm {
  id: string;
  name?: string;
  type: PebElementType;
  parent?: { id: string, type: PebElementType };
  text?: string;
  children: PebClientElm[];
  prev: string | null;
  next: string | null;
  defs: PebValueByScreen<PebClientElementDef>;
  visible?: boolean;
  link?: PebLink;
  data?: any;
  animations?: { [key: string]: PebAnimation };
  integration?: PebIntegration;
  interactions?: { [id: string]: PebInteraction };
  design?: PebDesign;
  versionNumber?: number;
}

export type PebClientElement = Immutable<PebClientElm>;

export interface PebClientRenderingOptions {
  screens: PebScreen[];
  languages: PebLanguage[];
  languageKey?: string;
  pages: PebMap<PebPage | PebViewPage>;
}

export interface PebClientBootstrapData {
  appType: AppType,
  channelSet?: string;
  businessId: string;
  applicationId: string;
  theme: PebTheme;
  publishedVersion: number;
  channelSetId?: string;
  pages: Partial<PebPage>[];
  query: PebViewQueryModel;
  config: PebBrowserConfig;
  apiCachedData?: PebMap<any>;
  hasRenderError?: boolean;
}

export interface PebBrowserConfig {
  appType: string;
  host: string;
  apiUrl: string;
  builderApiUrl: string;
}
