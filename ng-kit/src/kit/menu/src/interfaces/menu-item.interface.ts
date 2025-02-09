export interface MenuItemInterface {
  title: string;
  iconId?: string;
  iconSize?: string;
  children?: MenuItemInterface[];
  onClick?(): void;
}
