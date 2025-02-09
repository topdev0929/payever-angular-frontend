export interface MenuConfig {
  data: {
    title: string;
    list: MenuListItem[];
  };
  hasBackdrop?: boolean;
  backdropClass?: string;
  panelClass?: string;
}

export interface MenuListItem {
  label: string;
  value: string;
  red?: boolean;
}
