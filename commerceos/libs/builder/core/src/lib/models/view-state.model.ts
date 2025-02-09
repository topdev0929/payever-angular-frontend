import { PebAnimation } from './animation.model';
import { PebClientElm, PebElementStyles, PebPageVariant, PebRestrictAccess, PebScript } from './client';
import { PebContextTree, PebRootContext } from './context.model';
import { PebViewCookiesPermission } from './cookies.model';
import {
  PebElementType,
  PebMap,
  PebValueByScreen,
  PebViewStyle,
  PebViewVector,
} from './element.model';
import { PebRenderContainer } from './event.model';
import { PebFill, PebVideoPlayStatus } from './fill.model';
import { PebIntegration } from './integration.model';
import { PebInteraction } from './interaction.model';
import { PebPageSeoData, PebTheme } from './interfaces';
import { PebLink } from './link.model';


export interface PebViewStateModel {
  theme?: PebTheme;
  screenKey: string;
  languageKey: string;
  pageId: string;
  pages: PebMap<PebViewPage>;
  rootElementId: string;
  elements: PebMap<PebRenderElementModel>;
  container?: PebRenderContainer;
  query: PebViewQueryModel;
  rootContext?: PebRootContext;
  contexts: PebMap<PebContextTree>;
  scripts: PebMap<PebScript>;
}

export interface PebViewQueryModel {
  languageKey?: string;
  enableLazyLoading?: boolean;
  isSearchEngine?: boolean;
  urlParameters?: { [key: string]: string };
  cookiesPermission?: PebViewCookiesPermission;
}

export interface PebRenderElementModel {
  id: string;  
  parent?: { type: PebElementType; id: string } | any;
  name?: string;  
  type: PebElementType;
  animations?: { [key: string]: PebAnimation };
  defs?: PebRenderElementDef;
  fill?: PebFill;
  integration?: PebIntegration;
  interactions?: { [id: string]: PebInteraction };
  link?: PebLink;
  text?: string;
  children: PebRenderElementModel[];
  style: PebViewStyle;    
  container: PebRenderContainer;
  vector?: PebViewVector;
  screenKey: string;
  state?: PebRenderElementState;
  updateVersion?: number;
  page?: string;
  versionNumber?: number;
  origin?: { id: string };
}

export interface PebRenderElementDef {
  screenStyles: PebValueByScreen<PebViewStyle>;
  pebStyles: PebValueByScreen<PebElementStyles>;
}

export interface PebRenderElementState {
  inViewport?: boolean;
  video?: {
    playStatus: PebVideoPlayStatus;
    setTime?: number;
  };
  animation?: PebAnimation;
  keyframe?: {
    keyframeIndex: number;
    keyframesCount: number;
  };
  slider?: {
    contentElementId?: string;
    slideIndex: number;
    slidesCount: number;
    playing: boolean;
  };
}

export interface PebViewPageScrollInfo {
  top: number;
  height: number;
}

export interface PebViewPage {
  id: string;
  name: string;
  variant: PebPageVariant;
  seo: PebPageSeoData;
  deleted?: true;
  versionNumber: number;
  url: string;
  updatedAt: Date;
  restrictAccess?: PebRestrictAccess;
  rootElement?: PebClientElm;
  elements?: PebMap<PebRenderElementModel>;
  master?: { isMaster?: boolean, page?: string };
  parentId?: string;
  defaultLanguage?: string;
  fonts?: any;
}

export type PebRenderUpdateModel = { id: string } & Partial<PebRenderElementModel>;