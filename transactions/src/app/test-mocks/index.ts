import { DetailInterface, ActionInterface } from "../modules/shared"
import { PaymentMethodEnum } from "@pe/checkout-sdk/sdk/types"

export const mockTransactionsListData = {
collection: [
      {
    action_running: false,
    santander_applications: [] as any [],
    uuid: "a3f600d8-776a-4cfd-be25-512951049090",
    status: "STATUS_IN_PROCESS",
    currency: "NOK",
    customer_name: "Stub Signed",
    customer_email: "test@test.com",
    channel: "link",
    amount: 5000,
    total: 5000,
    items: [] as any [],
    created_at: "2019-10-04T06:07:48.000Z",
    updated_at: "2019-10-04T06:08:44.000Z",
    payment_details: "{\"transaction_id\":\"0CF296908Y2523314\",\"transaction_status\":\"Pending\",\"ipn_url\":\"https://checkout-php.test.devpayever.com/paypal/payment/e943a72920ddad8b43616bf71c7c68b0/ipn-message/receive\"}",
    business_option_id: 25540,
    reference: "NDFIA5xSSn52NWs7",
    user_uuid: "57beba81-f698-4278-a1aa-cc9efec58186",
    delivery_fee: 0,
    payment_fee: 95.35,
    down_payment: 0,
    shipping_method_name: "",
    shipping_order_id: "",
    billing_address: {
      salutation: "SALUTATION_MR",
      first_name: "Stub",
      last_name: "Signed",
      email: "test@test.com",
      country: "NO",
      country_name: "Norway",
      city: "Oslo",
      zip_code: "0353",
      street: "Majorstuveien 13",
      _id: "8ea5054b-fc8f-4acd-93cc-68be141d4e5d"
        },
    type: "paypal",
    business_uuid: "ea929a15-851c-4640-9f08-9055b55161ea",
    merchant_name: "NO",
    merchant_email: "payever.automation@gmail.com",
    seller_name: "Seller NO",
    seller_email: "seller-payever.automation@gmail.com",
    payment_flow_id: "b948a42062973a38b1b525b48a835eff",
    channel_set_uuid: "34f9c191-ddec-4043-b470-00564f60f8fb",
    original_id: "e943a72920ddad8b43616bf71c7c68b0",
    history: [
          {
        upload_items: [] as any [],
        refund_items: [] as any [],
        payment_status: "STATUS_IN_PROCESS",
        action: "statuschanged",
        created_at: "2019-10-04T06:08:44.000Z",
        _id: "5d96e1ec857a340013f7d28a"
          }
        ],
    __v: 0,
    place: "new",
    _id: "5d96e1b4857a340013f7d282"
      },
      {
    action_running: false,
    santander_applications: [] as any [],
    uuid: "38fd2c42-929f-4f2e-a755-c8f27f375b4e",
    status: "STATUS_IN_PROCESS",
    currency: "DKK",
    customer_name: "Stub Signed",
    customer_email: "test@test.com",
    channel: "link",
    amount: 5000,
    total: 5000,
    items: [] as any [],
    created_at: "2019-10-04T06:07:31.000Z",
    updated_at: "2019-10-04T06:08:31.000Z",
    payment_details: "{\"transaction_id\":\"37L49428FT5045547\",\"transaction_status\":\"Pending\",\"ipn_url\":\"https://checkout-php.test.devpayever.com/paypal/payment/5d9887c4eab9453492698eb76dda62e8/ipn-message/receive\"}",
    business_option_id: 25519,
    reference: "4VanuaV7Ruq4ivbF",
    user_uuid: "57beba81-f698-4278-a1aa-cc9efec58186",
    delivery_fee: 0,
    payment_fee: 95.35,
    down_payment: 0,
    shipping_method_name: "",
    shipping_order_id: "",
    billing_address: {
      salutation: "SALUTATION_MR",
      first_name: "Stub",
      last_name: "Signed",
      email: "test@test.com",
      country: "DK",
      country_name: "Denmark",
      city: "Herning",
      zip_code: "7400",
      street: "Silkeborgvej",
      _id: "dd3c60f3-1c7d-4446-a9f1-b5801dab77ab"
        },
    type: "paypal",
    business_uuid: "773eccd4-aed5-4f8b-8b15-8925628c22d8",
    merchant_name: "DK",
    merchant_email: "payever.automation@gmail.com",
    payment_flow_id: "989ecab45c3da13fc775ae2fe7b5bffb",
    channel_set_uuid: "b7be351b-87c3-463e-80ed-ff77cc77f15e",
    original_id: "5d9887c4eab9453492698eb76dda62e8",
    history: [
          {
        upload_items: [] as any [],
        refund_items: [] as any [],
        payment_status: "STATUS_IN_PROCESS",
        action: "statuschanged",
        created_at: "2019-10-04T06:08:31.000Z",
        _id: "5d96e1df857a340013f7d287"
          }
        ],
    __v: 0,
    place: "new",
    _id: "5d96e1a3857a340013f7d27d"
      }
    ],
filters: {},
pagination_data: {
  amount: 16059551.85,
  amount_currency: "EUR",
  page: 1,
  total: 33531
    },
usage: {
  specific_statuses: [
    'SALE',
    'SIGNED',
    'STATUS_SANTANDER_APPROVED',
    'UNTRACEABLE',
    'ACCEPTED',
    'SUCCESS',
    'NEW_TRANSACTION',
    'APPROVED',
    'STATUS_SANTANDER_AUTOMATIC_DECLINE',
    'DENIED'
      ],
  statuses: [
    'STATUS_ACCEPTED',
    'STATUS_IN_PROCESS',
    'STATUS_PAID',
    'STATUS_NEW',
    'STATUS_FAILED',
    'STATUS_DECLINED',
    'STATUS_CANCELLED',
    'STATUS_REFUNDED',
    'APPROVED'
      ],
      stores: [] as any [],
    }
  }

export const mockUserBusinessSettings = {
active: false,
hidden: false,
contactEmails: [] as any,
cspAllowedHosts: [] as any,
_id: "13531581-1655-4ec2-be3d-64c5095e12c4",
name: "test",
companyAddress: {
  _id: "1254c899-917b-40bc-a930-a790bccdf536",
  country: "DE",
  city: "Hamburg",
  street: "Rodeingestrasse",
  zipCode: "200465",
  updatedAt: "2019-09-24T09:05:31.241Z",
  createdAt: "2019-09-24T09:05:31.241Z"
    },
companyDetails: {
  _id: "e68fb75e-b202-4820-bcde-8e87e2f99caf",
  legalForm: "",
  employeesRange: {
    _id: "b85ad299-d345-4066-ba97-c6bc714375ab"
      },
  salesRange: {
    _id: "2cbc48bf-a637-4190-9109-3dc5fd00cb79"
      },
  product: "BUSINESS_PRODUCT_RETAIL_B2B",
  industry: "BRANCHE_FINISHING_PRODUTS",
  urlWebsite: "",
  updatedAt: "2019-08-02T06:34:23.798Z",
  createdAt: "2019-08-02T06:34:23.798Z"
    },
contactDetails: {
  _id: "2efab33e-a71a-45bb-85a1-2131d7699b67",
  salutation: "",
  firstName: "Rob",
  lastName: "Top",
  phone: "+4910222222222",
  fax: "",
  additionalPhone: "",
  updatedAt: "2019-07-22T10:16:38.055Z",
  createdAt: "2019-07-22T10:16:38.055Z"
    },
owner: "c6e6b1a6-e7c7-48ee-979c-5886904e2f9a",
currency: "EUR",
createdAt: "2019-02-27T09:15:50.983Z",
updatedAt: "2019-10-04T08:16:09.479Z",
__v: 0,
bankAccount: {
  _id: "53625ee0-f35f-4180-9417-741dad703279",
  owner: "",
  bankName: "",
  country: "DE",
  city: "",
  bic: "dhfiauhiufewiurue",
  iban: "128387817287387182",
  updatedAt: "2019-07-30T12:08:18.210Z",
  createdAt: "2019-07-30T12:08:18.210Z"
    },
taxes: {
  _id: "3494ac61-e023-4998-9021-199671f36608",
  companyRegisterNumber: "",
  taxId: "",
  taxNumber: "",
  turnoverTaxAct: false,
  updatedAt: "2019-07-22T10:16:38.055Z",
  createdAt: "2019-07-22T10:16:38.055Z"
    },
logo: null as any,
defaultLanguage: "de"
  }

export const mockActions = [
    {
        action: 'authorize',
        enabled: true,
        _label: 'authorize',
    },
    {
        action: 'update',
        enabled: true,
        _label: 'update',
    },
    {
        action: 'refund',
        enabled: true,
        _label: 'refund',
    }
]

export const mockTransaction = {
    id: 'test Id',
    original_id: 'test Id',
    uuid: '23k343-43rffwfdsf-32wsdf-sdfdsfs',
    currency: 'EUR',
    amount: 300,
    amount_refunded: 12,
    amount_rest: 288,
    total: 600,
    created_at: '2019-10-04T06:07:31.000Z',
    updated_at: '2019-10-04T06:07:31.000Z',
    example: false,
  }

export const mockAddress = {
    city: "Hamburg",
    country: "DE",
    createdAt: "2019-09-24T09:05:31.241Z",
    street: "Rodeingestrasse",
    updatedAt: "2019-09-24T09:05:31.241Z",
    zipCode: "200465"
}

export const mockPaymentDetailsWithOrder = {
    order: {
        finance_id: 'test id',
        usage_text: 'Santander Invoice (DE)'
      },
      credit_answer: 'test'
}

export const mockChartItem = {
    uuid: 'test',
    description: 'test',
    fixed_shipping_price: 6,
    identifier: 'test',
    item_type: 'test',
    name: 'test',
    price: 6,
    price_net: 6,
    product_variant_uuid: 'test',
    quantity: 6,
    shipping_price: 6,
    shipping_settings_rate: 6,
    shipping_settings_rate_type: 'test',
    shipping_type: 'test',
    thumbnail: 'test',
    updated_at: 'test',
    url: 'test',
    vat_rate: 6,
    weight: 6,
    created_at: 'test',
}

export const mockRefundItem = {
    item_uuid: 'test',
    count: 6,
}

export const mockOrder: DetailInterface =  {
    actions: mockActions as ActionInterface[],
    transaction: mockTransaction,
    billing_address: mockAddress,
    details: mockPaymentDetailsWithOrder,
    payment_option: {
      id: 'test id',
      type: PaymentMethodEnum.CASH,
      down_payment: 6,
      payment_fee: 6,
      fee_accepted: true,
    },
    status: {
      general: "STATUS_ACCEPTED",
      specific: 'STATUS_SANTANDER_IN_PROCESS',
      place: 'top',
      color: 'blue',
    },
    channel_set: {
      uuid: 'trst',
    },
    user: {
      uuid: 'test',
    },
    business: {
      uuid: 'test',
    },
    payment_flow: {
      id: 'test',
    },
    channel: {
      name: 'test',
      uuid: 'test'
    },
    customer: {
      email: 'test@test.com',
      name: 'test'
    },
    history: [
        {
            action: "statuschanged",
            created_at: "2019-10-03T14:09:17.000Z",
            payment_status: "STATUS_ACCEPTED",
            refund_items: [] as any[],
            amount: '56',
            reason: 'test',
            is_items_restocked: true
        }
    ],
    cart: {
      items: [mockChartItem, mockChartItem, mockChartItem, mockChartItem, mockChartItem],
      available_refund_items: [mockRefundItem, mockRefundItem],
    },
    merchant: {
      email: 'merchant@test.com',
      name: 'merchant',
    },
    shipping: {
      order_id: '313131w4423',
      address: mockAddress,
      category: 'test',
      method_name: 'test',
      option_name: 'test',
      delivery_fee: 12,
      example_label: 'test'
    },
    store: {
      id: 'test',
      name: 'test'
    },
    _itemsArray: { test: mockChartItem, test1: mockChartItem },
    _refundFixedAmount: 12,
    _refundItems: [{...mockRefundItem, payment_item_id: 'test'}],
    _refundReason: 'test',

    _isCash: true,
    _isInvoice: true,
    _isPayex: true,
    _isPaymill: true,
    _isPaypal: true,
    _isSantander: true,
    _isSantanderDe: true,
    _isSantanderAt: true,
    _isSantanderDk: true,
    _isSantanderNo: true,
    _isSantanderNl: true,
    _isSantanderPosDeFactInvoice: true,
    _hideUpdateStatusAction: true,
    _isSantanderDeInvoice: true,
    _isSantanderNoInvoice: true,
    _isSofort: true,
    _isStripe: true,
    _showSantanderContract: true,
    _showSantanderFactoringContract: true,
    _showSantanderInvoiceContract: true,
    _showCreditAnswer: true,
    _showSantanderDeQr: true,
    _santanderApplicationNo: 'test',
    _applicationNo: 'test',
    _panId: 'test',
    _statusColor: 'test',
  }

export const mockColumns = [
    {
      name: 'channel',
      title: 'channel',
      isActive: false,
      isToggleable: false,
    },
    {
      name: 'original_id',
      title: 'original_id',
      isActive: false,
      isToggleable: false,
    },
    {
      name: 'reference',
      title: 'reference',
      isActive: false,
      isToggleable: true,
    },
    { name: 'total', title: 'total', isActive: false, isToggleable: false },
    { name: 'type', title: 'type', isActive: false, isToggleable: true },
    {
      name: 'customer_email',
      title: 'customer_email',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'customer_name',
      title: 'customer_name',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'merchant_email',
      title: 'merchant_email',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'merchant_name',
      title: 'merchant_name',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'seller_email',
      title: 'seller_email',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'seller_name',
      title: 'seller_name',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'created_at',
      title: 'created_at',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'status',
      title: 'status',
      isActive: false,
      isToggleable: true,
    },
    {
      name: 'specific_status',
      title: 'specific_status',
      isActive: false,
      isToggleable: true,
    },
  ]

  export const mockFilters = [
    { key: 'test', value: 'test', condition: 'not in' },
    { key: 'test', value: 'test', condition: 'in' },
  ]

  export const mockActionRequest: any = {
    amount: 64,
    dunningCosts: 3,
    customerId: 'test',
    invoiceDate: '2019-10-03T14:09:17.000Z',
    itemsRestocked: true,
    reason: 'test',
    refundCollectedBySepa: false,
    refundItems: [mockRefundItem],
    refundGoodsReturned: true,
    refundInvoiceNumber: 'test',
    status: 'PENDING',
  }
