export type PebDesign =
  PebNoRenderDesign
  | PebContextTableDesign
  | PebContextTableCellDesign;

export enum PebDesignType {
  NoRender = 'no-render',
  ContextTable = 'context-table',
  ContextTableCell = 'context-table-cell',
}

export interface PebNoRenderDesign {
  type: PebDesignType.NoRender;
}

export interface PebContextTableDesign {
  type: PebDesignType.ContextTable;
  templateCell: string;
  originalCells: string[];
  emptyCellMode: undefined | 'hide';
}

export interface PebContextTableCellDesign {
  type: PebDesignType.ContextTableCell;
  table: string;
}


export const isContextTableDesign = (m: PebDesign | undefined): m is PebContextTableDesign =>
  m?.type === PebDesignType.ContextTable;

export const isContextTemplateCell = (m: PebDesign | undefined): m is PebContextTableCellDesign =>
  m?.type === PebDesignType.ContextTableCell;

export interface PebResizeSetting {
  resizeText: boolean;
  borderRadius: boolean;
  resizeChildren: boolean;
}

export const PEB_DEFAULT_RESIZE_SETTING: PebResizeSetting = {
  resizeText: true,
  borderRadius: true,
  resizeChildren: true,
};
