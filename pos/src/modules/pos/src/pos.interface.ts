import { EditorSidebarTypes } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

export interface ViewItem {
  title: string;
  disabled: boolean;
  active: boolean;
  image: string;
  option?: EditorSidebarTypes | ShopEditorSidebarTypes| 'preview' | string;
  options?: ViewItem[];
}
