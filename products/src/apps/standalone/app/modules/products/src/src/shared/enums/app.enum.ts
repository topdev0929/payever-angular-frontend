import { EditMenuComponent } from '../../products-list/components/edit-menu/edit-menu.component';

export enum AppInstanceEnum {
  Shop = 'shop',
  Marketing = 'marketing',
  Pos = 'pos',
  Builder = 'builder',
}

export const Components = {
  editMenu: EditMenuComponent,
};

export enum AppItems {
  Collection ,
  Product,
}
