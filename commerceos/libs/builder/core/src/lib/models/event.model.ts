import { PebIntegrationAction } from './integration.action.model';

import { PebContext } from '.';


export enum PebViewElementEventType {
  None = 'none',
  Init = 'init',
  Click = 'click',
  MouseEnter = 'mouse.enter',
  MouseLeave = 'mouse.leave',
  ViewportEnter = 'viewport.enter',
  ViewportExit = 'viewport.exit',
  ViewportFocusSection = 'viewport.focus-section',
  PageScroll = 'page.scroll',
  SliderIndexChange = 'slider.index-change',
  SliderContentChange = 'slider.content-change',
  SliderPlay = 'slider.play',
  SliderPause = 'slider.pause',
  AnimationKeyframeChange = 'animation.keyframe-change',
  VideoPlay = 'video.play',
  VideoPause = 'video.pause',
  ContextData = 'context.data',
  CookiesInitial = 'coockies.init',
}

export interface PebIntegrationEvent {
  action: PebIntegrationAction;
  context?: PebContext;
}

export enum PebContainerType {
  Editor = 'editor',
  Dashboard = 'dashboard',
  Client = 'client',
  Preview = 'preview',
  SSR = 'ssr',
}

export interface PebRenderContainer {
  key: PebContainerType | string,
  editMode?: boolean;
  previewMode?: boolean;
  renderScripts: boolean;
}

export const isEditorContainer = (container: PebRenderContainer | undefined): boolean =>
  container?.key === PebContainerType.Editor;

export const isDashboardContainer = (container: PebRenderContainer | undefined): boolean =>
  container?.key === PebContainerType.Dashboard;

export const isClientContainer = (container: PebRenderContainer | undefined): boolean =>
  container?.key === PebContainerType.Client;

export const isSSRContainer = (container: PebRenderContainer | undefined): boolean =>
  container?.key === PebContainerType.SSR;