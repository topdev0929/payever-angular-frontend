import { CategoryType } from '../enums';

interface CategoryInterface {
  color?: string;
  guid?: string;
  header_title?: string;
  id?: string;
  item_ids?: string[];
  is_show_in_list?: boolean;
  name?: string;
  logo?: CategoryHeaderLogoInterface;
  opacity?: string;
  position?: number;
  selection_type?: CategoryType;
  taxonomy_ids?: string[];
  text_style?: CategoryTextStyleInterface;
}

// interface CategoryFontSizeInterface {
  // title: string;
  // size: number;
// }

interface CategoryHeaderLogoInterface {
  id: number;
  url: string;
  overlay_color: string;
  overlay_opacity: number;
}

interface CategoryTextStyleInterface {
  bold?: boolean;
  fontSize?: number;
  italic?: boolean;
  underline?: boolean;
}

interface CategoriesTree {
  has_children: boolean;
  id: number;
  lvl: number;
  title: string;
  root_title?: string;
  uuid: string;
  path: CategoriesTree[];
  language?: string;
  full_path?: string;
  created_at?: string;
  updated_at?: string;
  positive_attributes?: any[];
  negative_attributes?: any[];
}

interface TaxonomyCategoryInterface {
  created_at?: string;
  full_path?: string;
  has_children: boolean;
  id: number;
  language?: string;
  lvl: number;
  negative_attributes?: any[];
  path: TaxonomyCategoryInterface[];
  positive_attributes?: any[];
  root_title?: string;
  title: string;
  updated_at?: string;
  uuid: string;
}

interface CreateCategoryOnServerInterface {
  category: CategoryInterface;
  activateAfterCreating?: boolean;
}

// function sortCategories(category1: CategoryInterface, category2: CategoryInterface): number {
  // if (category1.position > category2.position) {
    // return 1;
  // } else if (category1.position < category2.position) {
    // return -1;
  // } else {
    // return 0;
  // }
// }

export {
  CategoryInterface,
  // CategoryFontSizeInterface,
  CategoryHeaderLogoInterface,
  CategoriesTree,
  CategoryTextStyleInterface,
  // sortCategories,
  TaxonomyCategoryInterface,
  CreateCategoryOnServerInterface
};
