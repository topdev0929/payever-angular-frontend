export interface IFilterItem {
  title: string;
  onSelect?: ( event: MouseEvent, item: IFilterItem ) => void;
}
