export interface DataGridSelectBarButtonInterface<T> {
  title: string;
  onSelect?(selectedItems: T[]): void;
}
