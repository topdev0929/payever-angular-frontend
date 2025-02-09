export interface TerminalListAction {
  id?: number;
  label: string;
  onSelect?: (action: TerminalListAction, item: TerminalListItem) => void
}
export interface TerminalListItem {
  title: string;
  desc: string;
  iconPng?: string;
  content?: string;
  action?: TerminalListAction;
  actionGroup?: TerminalListAction[];
  hasSwitch?: boolean;
  switchOn?: boolean;
}

export interface TerminalListSelect {
  action: TerminalListAction;
  item: TerminalListItem
}
export interface TerminalListToggle {
  switch: boolean;
  item: TerminalListItem
}
