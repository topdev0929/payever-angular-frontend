import { PebElementStyles } from './models/client';
import { PebScreen } from './models/interfaces';
import { PebPositionType } from './models/position.model';
import { PebUnit } from './models/size.model';

export const BUILDER_CORE_VERSION = '0.9.0-beta';

export enum PebScreenEnum {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

export const PEB_DEFAULT_FONT_SIZE = 15;
export const PEB_DEFAULT_BACKGROUND_COLOR = '#d4d4d4';
export const PEB_DEFAULT_FONT_COLOR = '#000000';
export const PEB_DEFAULT_FONT_COLOR_RGBA = { r: 0, g: 0, b: 0, a: 1 };
export const PEB_DEFAULT_LINK_COLOR = '#067af1';
export const PEB_DEFAULT_FONT_FAMILY = 'Roboto';
export const PEB_WHITE_RGBA = { r: 255, g: 255, b: 255, a: 1 };
export const PEB_BORDER_COLOR = { r: 0, g: 0, b: 0, a: 1 };

export const pebLinkDatasetLink = {
  type: 'peb-link-action',
  payload: 'peb-link-payload',
};

export const PebDefaultScreens: { [key: string]: PebScreen } = {
  [PebScreenEnum.Desktop]: {
    key: 'desktop',
    title: 'Desktop',
    width: 1024,
    padding: 88,
    icon: 'desktop',
  },
  [PebScreenEnum.Tablet]: {
    key: 'tablet',
    title: 'Tablet',
    width: 768,
    padding: 0,
    icon: 'tablet',
  },
  [PebScreenEnum.Mobile]: {
    key: 'mobile',
    title: 'Mobile',
    width: 360,
    padding: 0,
    icon: 'mobile',
  },
};

export const PEB_ROOT_SCREEN_KEY = PebScreenEnum.Desktop;

export const PEB_ELEMENT_BASE_STYLE: Partial<PebElementStyles> = {
  dimension: { 
    width: { value: 0, unit: PebUnit.Auto },
    height: { value: 0, unit: PebUnit.Auto },
  },
  position: { 
    type: PebPositionType.Default,
    bottom: { value: 0, unit: PebUnit.Auto },
    top: { value: 0, unit: PebUnit.Auto },
    left: { value: 0, unit: PebUnit.Auto },
    right: { value: 0, unit: PebUnit.Auto },
  },
};

export enum PebScriptTrigger {
  PageView = 'PageView',
  DOMReady = 'DOMReady',
  WindowLoaded = 'WindowLoaded',
}

export const DEFAULT_TRIGGER_POINT = PebScriptTrigger.PageView;

export interface PebEditorCommand<T = any> {
  type: string;
  params?: T;
}
