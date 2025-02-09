import { PebDynamicParams } from './integration.model';

export enum PebLinkType {
  InternalPage = 'internal-page',
  Anchor = 'anchor',
  ExternalUrl = 'external-url',
  ContextLink = 'context-link',
}

export enum PebLinkTarget {
  Self = 'self',
  Blank = 'blank',
  Modal = 'modal',
}

export type PebLink = PebInternalPage
  | PebAnchorLink
  | PebExternalUrl;

export interface PebInternalPage {
  type: PebLinkType.InternalPage;
  anchorElement?: {
    id: string;
    name: string;
  };
  title: string;
  pageId: string;
  urlParameters?: { [key: string]: string };
  target: PebLinkTarget;
  dynamicParams?: PebDynamicParams;
  url?: string;
}

export interface PebAnchorLink {
  type: PebLinkType.Anchor;
  anchorElementId: string;
  fragment: string;
  dynamicParams?: PebDynamicParams;
}

export interface PebExternalUrl {
  type: PebLinkType.ExternalUrl;
  url: string;
  title?: string;
  target: PebLinkTarget;
  dynamicParams?: PebDynamicParams;
}

export const isInternalPage = (m?: any): m is PebInternalPage => m?.type === PebLinkType.InternalPage;
export const isAnchorLink = (m?: any): m is PebAnchorLink => m?.type === PebLinkType.Anchor;
export const isExternalUrl = (m?: any): m is PebExternalUrl => m?.type === PebLinkType.ExternalUrl;
export const isContextLink = (m?: any): m is PebInternalPage => m?.type === PebLinkType.ContextLink;
