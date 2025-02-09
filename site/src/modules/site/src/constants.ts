import { InjectionToken } from '@angular/core';

import { EditorSidebarTypes } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebElementType, PebPageType } from '@pe/builder-core';

import { ViewItem } from './site.interface'

export const PEB_SITE_HOST = new InjectionToken<string>('PEB_SITE_HOST');
export const PEB_SITE_API_PATH = new InjectionToken<string>('SITE_API_PATH');
export const PEB_SITE_API_BUILDER_PATH = new InjectionToken<string>('SITE_API_BUILDER_PATH');

export const INSERT_OPTION: ViewItem[] = [
  {
    title: 'Rectangle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Rounded rectangle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        borderRadius: 20,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Line',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        height: 1,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Circle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        borderRadius: 50,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
    lineAfter: true,
  },
  {
    title: 'Components',
    disabled: false,
    active: false,
    option: 'openShapesDialog',
    lineAfter: true,
  },
  {
    title: 'Add new page',
    disabled: false,
    active: false,
    option: 'createPage',
    payload: { type: PebPageType.Replica },
    // lineAfter: true,
  },
];

export const EDIT_OPTION: ViewItem[] = [
  {
    title: 'Choose language',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/language.svg',
    option: 'openLanguagesDialog',
  },
  {
    title: 'Edit language',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/manage-languages.png',
    option: 'toggleLanguagesSidebar',
  },
  {
    title: 'SEO',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/seo.svg',
    option: 'toggleSeoSidebar',
  },
  {
    title: 'Scripts',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/scripts.svg',
    option: 'openScriptsDialog',
  },
];

export const SITE_NAVIGATION = [
  {
    id: 'edit',
    name: 'site-app.actions.edit',
    parentId: null,
    image: '/assets/icons/edit.png',
    children: [],
  },
  {
    id: 'settings',
    name: 'site-app.settings.title',
    parentId: null,
    image: '/assets/icons/settings.png',
    children: [],
  },
  {
    id: 'themes',
    name: 'site-app.themes.title',
    parentId: null,
    image: '/assets/icons/theme.png',
    children: [],
  },
]

export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

export const OPTIONS: ViewItem[] = [
  {
    title: 'site-app.view_options.navigator',
    disabled: false,
    active: false,
    image: '/assets/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'site-app.view_options.inspector',
    disabled: false,
    active: false,
    image: '/assets/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'site-app.view_options.master_pages',
    disabled: false,
    active: false,
    image: '/assets/icons/master-pages.png',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'site-app.view_options.layer_list',
    disabled: false,
    active: false,
    image: '/assets/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  // {
  //   title: 'site-app.view_options.history',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/icons/history.png',
  //   option: EditorSidebarTypes.History,
  // },

  {
    title: 'site-app.view_options.preview',
    disabled: false,
    active: false,
    image:'/assets/icons/preview.png',
    option: 'preview',
  },

];
