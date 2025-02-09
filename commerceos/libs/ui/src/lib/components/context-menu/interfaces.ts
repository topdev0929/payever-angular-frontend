export interface ContextMenuConfig {
  data: {
    title: string;
    list: ContextMenuListItem[];
  }
}

export interface ContextMenuListItem {
  label: string;
  value: string;
  red?: boolean;
}
  