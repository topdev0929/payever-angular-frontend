import { InjectionToken } from '@angular/core';

import { EditorSidebarTypes } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

import { ViewItem } from './blog.interface'

export const PEB_BLOG_HOST = new InjectionToken<string>('PEB_BLOG_HOST');

export const BLOG_NAVIGATION = [
  {
    id: 'edit',
    name: 'blog-app.actions.edit',
    image: '/assets/icons/edit.png',
  },
  {
    id: 'settings',
    name: 'blog-app.settings.title',
    image: '/assets/icons/settings.png',
  },
  {
    id: 'themes',
    name: 'blog-app.themes.title',
    image: '/assets/icons/theme.png',
  },
];


export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

export const EDIT_OPTION: ViewItem[] = [
  {
    title: 'Choose language',
    disabled: false,
    active: false,
    image: '/assets/icons/language.svg',
    option: 'openLanguagesDialog',
  },
  {
    title: 'Edit language',
    disabled: false,
    active: false,
    image: '/assets/icons/manage-languages.png',
    option: 'toggleLanguagesSidebar',
  },
  {
    title: 'SEO',
    disabled: false,
    active: false,
    image: '/assets/icons/seo.svg',
    option: 'toggleSeoSidebar',
  },
];

export const OPTIONS: ViewItem[] = [
  {
    title: 'Navigator',
    disabled: false,
    active: false,
    image: '/assets/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'Inspector',
    disabled: false,
    active: false,
    image: '/assets/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'Master pages',
    disabled: false,
    active: false,
    image: '/assets/icons/master-pages.png',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'Layer List',
    disabled: false,
    active: false,
    image: '/assets/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  // {
  //   title: 'Language',
  //   disabled: false,
  //   active: false,
  //   image: '/assets/icons/language.png',
  //   option: 'language',
  //   options: [
  //     ...Object.values(PebLanguage).map(lang => ({
  //       title: toTitleCase(lang),
  //       disabled: false,
  //       active: false,
  //       image: `/assets/shop/icons/language-${lang}.png`,
  //       option: `language.${lang}`,
  //     })),
  //     {
  //       title: 'Manage languages',
  //       disabled: false,
  //       active: false,
  //       image: '/assets/shop/icons/manage-languages.png',
  //       option: 'toggleLanguagesSidebar',
  //     },
  //   ],
  // },
  // {
  //   title: 'History',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/shop/icons/history.png',
  //   option: EditorSidebarTypes.History,
  // },
  // {
  //   title: 'Preview',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/shop/icons/preview.png',
  //   option: 'preview',
  // },
];
