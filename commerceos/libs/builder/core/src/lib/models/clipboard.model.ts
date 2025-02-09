import { BBox } from 'rbush';

import { PebElementDef, PebValueByScreen } from './element.model';

export type PebClipboardData = {
  positions: PebValueByScreen<{ [elementId: string]: BBox }>;
  elements: PebElementDef[];
};

export type PebClipboardRelativePosition = {
  [key: string]: { deltaX: number; deltaY: number };
};
