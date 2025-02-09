import { SafeHtml } from '@angular/platform-browser';
import Delta from 'quill-delta';

import { PebAnimation } from './animation.model';
import { PebElementStyles } from './client';
import { PebResizeSetting, PebDesign } from './design.model';
import { PebFill } from './fill.model';
import { PebIntegration } from './integration.model';
import { PebInteraction, PebInteractionWithPayload } from './interaction.model';
import { PebLayout } from './layout.model';
import { PebLink } from './link.model';
import { PebVector } from './vector.model';


export enum PebElementType {
  Document = 'document',
  Section = 'section',
  Text = 'text',
  Shape = 'shape',
  Grid = 'grid',
  Vector = 'vector',
}

export interface PebElementDef {
  id: string;
  name?: string;
  index: number;
  type: PebElementType;
  design?: PebDesign;
  styles: PebValueByScreen<Partial<PebElementStyles>>;
  prev: string | null;
  next: string | null;
  data?: PebElementDefData;
  meta?: PebElementDefMeta;
  parent?: { id: string; type: PebElementType; };
  animations?: { [key: string]: PebAnimation };
  integration?: PebIntegration;
  interactions?: { [id: string]: PebInteraction };
  link?: PebLink;
  deleted?: true;
  versionNumber?: number;
  master?: { page?: string; element?: string; };
  changeLog?: { version: number; };
  figma?: any;
}

export interface PebElementDefTree extends PebElementDef {
  index: number;
  children?: PebElementDefTree[];
}

export interface PebElementDefData {
  textAutosize?: { height: boolean, width: boolean };
  text?: PebValueByScreen<PebValueByLanguage<Delta>>;
  resizeSetting?: PebResizeSetting;
  syncSizePosition?: PebValueByScreen<boolean>;
  integrationTitles?: {
    action?: string;
    dataSource?: string;
    contextField?: string;
  };
  groupId?: string[];
  fullWidth?: boolean;
  version?: number;
  vector?: PebVector;
  textStyleName?: string;
  /** @deprecated */
  linkInteraction?: PebInteractionWithPayload;
  /** @deprecated */
  preview?: string;
  /** @deprecated */
  isLoading?: boolean;
  /** @deprecated */
  openInOverlay?: boolean;
  /** @deprecated */
  borderOptions?: any;
  /** @deprecated */
  borderColor?: any;
  constrainProportions?: boolean;
  /** @deprecated */
  cellsBorderOptions?: any;
  /** @deprecated */
  imageSize?: any;
  /** @deprecated */
  imageScale?: number;
  /** @deprecated */
  borderWidth?: any;
  /** @deprecated */
  spacing?: number;
}

export interface PebViewElement<T = PebCss> {
  id: string;
  name?: string;
  type: PebElementType;
  animations?: { [key: string]: PebAnimation };
  parent?: Partial<PebViewElement<T>>;
  children: Iterable<any>;
  style: T;
  pebStyles: Partial<PebElementStyles>;
  vector?: PebViewVector;
  textHTML: SafeHtml;
  text: Delta;
  select?: any;
  integration: PebIntegration;
  interactions?: { [id: string]: PebInteraction };
  link?: PebLink;
  layout?: PebLayout;
  fill?: PebFill;
  screenKey: string;
}

export interface PebViewStyle {
  host?: PebCss;
  inner?: PebCss;
  wrapper?: PebCss;
  class?: PebMap<boolean | undefined>;
}

export interface PebPartialContent {
  pageId: string;
  elementId: string;
}

export interface PebViewSvg {
  url: string;
  scale: number;
  tile: boolean;
}

export interface PebViewVector {
  vector: PebVector;
  styles: Partial<PebElementStyles>;
}

export interface PebElementDefMeta {
  deletable?: boolean;
  scalable?: boolean;
  borderRadiusDisabled?: boolean;
}

export enum PebPasteTypes {
  ElementDef = 'element-def',
  SVG = 'svg',
  FigmaPlugin = 'figma_plugin',
}

export type PebFigmaPluginClipboard = {
  elements: PebElementDef[];
  hashContentMap: Record<string, string>;
  source: PebPasteTypes.FigmaPlugin;
}

export type PebCss = Partial<CSSStyleDeclaration> & { aspectRatio?: string };
export type PebValueByLanguage<T> = { [key: string]: T };
export type PebValueByScreen<T> = { [key: string]: T };
export type PebMap<T> = { [id: string]: T };
