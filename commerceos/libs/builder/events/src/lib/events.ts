import { PebElement } from '@pe/builder/render-utils';

import { PeAnchorType } from './anchors';

export interface PebEvent {
  type: typeof pebEvents[keyof typeof pebEvents];
  x: number;
  y: number;
  shiftKey: boolean;
  metaKey: boolean;
  target: PebElement | PeAnchorType;
  button: PebMouseEventButton;
  originalEvent: MouseEvent;
}

export enum PebMouseEventButton {
  None = -1,
  Left = 0,
  Middle = 1,
  Right = 2,
}

export enum PebEventType {
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseup = 'mouseup',
  mouseleave = 'mouseleave',
  click = 'click',
  dblclick = 'dblclick',
  wheel = 'wheel',
  drop = 'drop',
  dragover = 'dragover'
}

export const pebEvents = {
  pointerdown: PebEventType.mousedown,
  pointermove: PebEventType.mousemove,
  pointerup: PebEventType.mouseup,
  mouseleave: PebEventType.mouseleave,
  click: PebEventType.click,
  dblclick: PebEventType.dblclick,
  wheel: PebEventType.wheel,
  drop: PebEventType.drop,
  dragover: PebEventType.dragover,
};


export const isMouseDownEvent = (ev: any): boolean => ev?.type === PebEventType.mousedown;
export const isMouseMoveEvent = (ev: any): boolean => ev?.type === PebEventType.mousemove;
export const isMouseUpEvent = (ev: any): boolean => ev?.type === PebEventType.mouseup;
export const isMouseLeaveEvent = (ev: any): boolean => ev?.type === PebEventType.mouseleave;
export const isClickEvent = (ev: any): boolean => ev?.type === PebEventType.click;
export const isDblClickEvent = (ev: any): boolean => ev?.type === PebEventType.dblclick;
export const isWheelEvent = (ev: any): boolean => ev?.type === PebEventType.wheel;
export const isDropEvent = (ev: any): boolean => ev?.type === PebEventType.drop;
export const isDragoverEvent = (ev: any): boolean => ev?.type === PebEventType.dragover;

export const isLeftMouseButtonEvent = (ev: any): boolean => ev && ev.button === PebMouseEventButton.Left;
export const isRightMouseButtonEvent = (ev: any): boolean => ev && ev.button === PebMouseEventButton.Right;
export const isMiddleMouseButtonEvent = (ev: any): boolean => ev && ev.button === PebMouseEventButton.Middle;