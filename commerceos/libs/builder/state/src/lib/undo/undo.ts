import { Patch } from 'immer';

export interface PebUndoResponse {
  id: string;
  name: string;
  result: boolean;
  data: {
    histories: Array<{
      id: string;
      patches: Patch[];
      reverses: Patch[];
    }>;
    pagination: {
      limit: number;
      page: number;
      total: number;
    }
  };
}

export interface PebUndoStateModel {
  length: number;
  index: number;
  offset: number;
  readonly limit: number;
  items: PebUndoItem[];
}

export interface PebUndoItem {
  id: string;
  patches: Patch[];
  inversePatches: Patch[];
}

export const defaultUndoState: PebUndoStateModel = {
  length: 0,
  index: 0,
  offset: 0,
  limit: 3,
  items: [],
};
