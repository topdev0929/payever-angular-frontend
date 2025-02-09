import { PebAPIDataSourceSchema, PebDataSourceTypes, PebFieldSchema, PebIntegrationDataType } from '@pe/builder/core';

export enum PebIntegrationAppNamesEnum {
  Auth = 'auth',
  Appointments = 'appointments',
  BillingSubscription = 'billing-subscription',
  Blog = 'blog',
  Contact = 'contact',
  Mailer = 'mailer',
  PayeverStudio = 'studio',
  PayeverShipping = 'shipping',
  Products = 'products',
  Settings = 'settings',
  Shop = 'shop',
  Site = 'site',
  Checkout = 'checkout',
  Language = 'language',
  Message = 'message',
  Pages = 'pages',
}

export const PAGE_SIZE = 20;

export const CheckoutDefaultCartInfo = {
  hasItem: false,
  itemsCount: 0,
  totalPrice: 0,
  items: [
    {
      title:'',
      quantity:0,
      id:'',
      print:0,
    },
  ],
};

export const CheckoutCartInfoDataSource: PebAPIDataSourceSchema[] = [
  {
    id: 'cart.info',
    type: PebDataSourceTypes.API,
    uniqueTag: 'payever.checkout.cart.info.for.builder',
    title: 'Cart Info',
    defaultParams: {},
    dataType: PebIntegrationDataType.Object,
    fields: [
      {
        dataType: PebIntegrationDataType.Boolean,
        name: 'hasItem',
        title: 'Has Item',
      },
      {
        dataType: PebIntegrationDataType.Number,
        name: 'itemsCount',
        title: 'Items Count',
      },
      {
        dataType: PebIntegrationDataType.Number,
        name: 'totalPrice',
        title: 'Total Price',
      },
      {
        dataType: PebIntegrationDataType.Array,
        name: 'items',
        title: 'Items',
        fields: [
          {
            dataType: PebIntegrationDataType.UUID,
            name: 'id',
            title: 'ID',
          },
          {
            dataType: PebIntegrationDataType.Number,
            name: 'price',
            title: 'Price',
          },
          {
            dataType: PebIntegrationDataType.String,
            name: 'title',
            title: 'Title',
          },
          {
            dataType: PebIntegrationDataType.Number,
            name: 'quantity',
            title: 'Quantity',
          },
        ],
      },
    ],
  } as any,
];

export const PebDefaultFilterFieldsSchema: PebFieldSchema[] = [
  {
    dataType: PebIntegrationDataType.String,
    name: 'title',
    title: 'Title',
  },
  {
    dataType: PebIntegrationDataType.String,
    name: 'field',
    title: 'Field',
  },
  {
    dataType: PebIntegrationDataType.Object,
    name: 'value',
    title: 'Value',
  },
];
