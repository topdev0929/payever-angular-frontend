import { InjectionToken } from '@angular/core';
import { EditorSidebarTypes } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebElementType, PebPageType } from '@pe/builder-core';
import { OverlayDataValue } from '@pe/builder-base-plugins';

export enum InvoiceEditorSidebarTypes {
  EditMasterPages = "edit-master-pages"
}
export type OverlayInvoiceDataValue = OverlayDataValue | InvoiceEditorSidebarTypes;

export interface ViewItem {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: EditorSidebarTypes | ShopEditorSidebarTypes| 'preview' | string;
  options?: ViewItem[];
  payload?: any;
  lineAfter?: boolean;
}

export const PEB_INVOICE_HOST = new InjectionToken<string>('PEB_INVOICE_HOST');
export const PEB_INVOICE_API_PATH = new InjectionToken<string>('PEB_INVOICE_API_PATH');
export const PEB_INVOICE_BUILDER_API_PATH = new InjectionToken<string>('PEB_INVOICE_BUILDER_API_PATH');
export const PE_CONTACTS_HOST: InjectionToken<string> = new InjectionToken<string>('PE_CONTACTS_HOST');

export enum InvoiceEnum {
  all = 'all',
  draft = 'DRAFT',
  sent = 'SENT',
  recieved = 'RECIEVED',
  // finalized = 'FINALIZED',
  // uncollectible = 'UNCOLLECTIBLE',
  // paid = 'PAID',
  // voided = 'VOIDED'
}

export enum FiltersEnum {
  today = 'today',
  lastWeek = 'last_week',
  lastMonth = 'last_month',
}
export const invoiceOptions: Array<TranslatedListOptionInterface<InvoiceEnum>> = [
  { labelKey: 'invoice-app.common.invoice.all', value: InvoiceEnum.all, image: 'all_filter' },
  // { labelKey: 'invoice-app.common.invoice.draft', value: InvoiceEnum.draft, image: 'edit' },
  // { labelKey: 'invoice-app.common.invoice.sent', value: InvoiceEnum.sent, image: 'accepted' },
  // { labelKey: 'invoice-app.common.invoice.recieved', value: InvoiceEnum.recieved, image: 'received' },
  // { labelKey: 'invoice-app.common.invoice.finalized', value: InvoiceEnum.finalized, image: 'finalized' },
  // { labelKey: 'invoice-app.common.invoice.uncollectible', value: InvoiceEnum.uncollectible, image: 'uncollectible' },
  // { labelKey: 'invoice-app.common.invoice.paid', value: InvoiceEnum.paid, image: 'paid' },
  // { labelKey: 'invoice-app.common.invoice.voided', value: InvoiceEnum.voided, image: 'voided' },
];

export const filterOptions: Array<TranslatedListOptionInterface<FiltersEnum>> = [
  { labelKey: 'invoice-app.common.invoice.today', value: FiltersEnum.today, image: 'calendar' },
  { labelKey: 'invoice-app.common.invoice.last_week', value: FiltersEnum.lastWeek, image: 'calendar' },
  { labelKey: 'invoice-app.common.invoice.last_month', value: FiltersEnum.lastMonth, image: 'calendar' },
];

export interface ListOptionInterface<T = string> {
  label: string;
  image: string;
  value: T;
}

export interface TranslatedListOptionInterface<T = string> extends Omit<ListOptionInterface<T>, 'label'> {
  labelKey: string;
}

export interface InvoiceTreeDataInterface {
  isFolder: boolean;
  category: InvoiceEnum;
}

export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

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
];

export const INVOICE_NAVIGATION = [
    {
      id: 'list',
      name: 'Invoices',
      parentId: null,
      image: '#icon-apps-app-file',
      children: [],
    },    {
      id: 'edit',
      name: 'Edit',
      parentId: null,
      image: '#icon-apps-app-edit',
      children: [],
    },

    {
      id: 'themes',
      name: 'Themes',
      parentId: null,
      image: '#icon-apps-app-themes',
      children: [],
    },
    {
      id: 'settings',
      name: 'Settings',
      parentId: null,
      image: '#icon-apps-app-settings',
      children: [],
    }
  ]

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
