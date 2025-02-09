export interface ShortcutsItemLinks {
  id: number,
  title: string
}
export interface ShortcutsItem {
  title: string;
  iconPng?: string;
  desc?: string;
  links?: ShortcutsItemLinks[];
}
