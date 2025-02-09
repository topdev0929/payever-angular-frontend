import {
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridTableActionCellComponent,
  PeGridMenu,
} from '@pe/grid';
import { PeGridSortingDirectionEnum, PeGridSortingOrderByEnum } from '@pe/grid/shared';

export interface PagesDialogDataInterface {
  themeId: string;
  [others: string]: any;
}

export const TOOLBAR_FILTERS = [];

export enum SideNavMenuActions {
  NewFolder = 'NEW_FOLDER',
};

export const FOLDERS_SIDENAV_MENU: PeGridMenu = {
  title: 'folders.context_menu.title',
  showCloseButton: false,
  items: [
    {
      label: 'folders.context_menu.add_folder',
      value: SideNavMenuActions.NewFolder,
    },
  ],
};


export const TOOLBAR_OPTIONS: PeGridMenu = {
  title: 'grid.toolbar.items_options_menu.title',
  items: [],
};

export const TOOLBAR_SORTING_MENU = {
  title: 'grid.toolbar.sort_menu.title',
  activeValue: {
    direction: PeGridSortingDirectionEnum.Descending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  },
  items: [],
};

export const TOOLBAR_CONFIG = {
  filterConfig: TOOLBAR_FILTERS,
  optionsMenu: TOOLBAR_OPTIONS,
  sortMenu: TOOLBAR_SORTING_MENU,
};

export const VIEW_MENU: PeGridMenu = {
  title: 'grid.content.toolbar.layout',
  items: [],
};


export const TABLE_DISPLAYED_COLUMNS: PeGridTableDisplayedColumns[] = [
  {
    name: 'name',
    title: 'grid.table_displayed_columns.name',
    cellComponent: PeGridTableTitleCellComponent,
  },
  {
    name: 'country',
    title: 'contacts-app.displayed_columns.country',
  },
  {
    name: 'action',
    title: '',
    cellComponent: PeGridTableActionCellComponent,
  },
];
