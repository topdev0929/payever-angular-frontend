import {
  PaymentInterface,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

type PaymentRespomseFixtureFunc = (
  status: PaymentStatusEnum
) => PaymentInterface;
export const paymentResponseFixture: PaymentRespomseFixtureFunc = (
  status: PaymentStatusEnum
) =>
  cloneDeep<PaymentInterface>({
    id: 'cf87a02f703954b5f6f7adf1d335831e',
    payment_flow_id: 'ac9d0c093c749cad7ee72ac7e1a3aea2',
    paymentOptionId: 23,
    amount: 200,
    down_payment: 0,
    total: 200,
    payment_data: null,
    status: status,
    remember_me: false,
    payment_details: {
      initialize_unique_id: '31HA07BC813E3979F41F196B3B1B11EE',
      finalize_unique_id: null,
      basket_id: '31HA07BC813E3979F41F3CCD0A631EA2',
      conditions_accepted: true,
      advertising_accepted: true,
      birthday: '01.02.2000',
      response_url:
      // eslint-disable-next-line
        "https://checkout-php.test.devpayever.com/api/rest/v3/checkout/santander-factoring-de/ac9d0c093c749cad7ee72ac7e1a3aea2/postback?token=%242y%2410%24mAf6oq6RejdfjvKZytgN2u4VL7QgUt8ScLTmrdlFRFNxoPUzDfXlW",
      // redirect_url: null,
      rate: 6,
      initialize_status_code: 80,
      interest_rate: 7.9,
      redirect_amount: 200,
      contract_pdf_url:
      // eslint-disable-next-line
        "https://test-heidelpay-dm.hpcgw.net/sdm-services/api/v1/customer/scb/installmentplan/2100090100/download/U2NiUmF0ZW5rYXVmSERQMjAxODc2MTAyMTM1NTIzMDg1",
      reservation_unique_id: '31HA07BC813E3979F41F2B48304EAFF8',
      receipt_unique_id: null,
      finalize_amount: null,
      usage_text: '76102135523085',
      posVerifyType: null,
      nominal_interest_rate: 5.47601,
      monthly_rate: 33.8,
      last_rate: 34.18,
      total_rate: 203.18,
      risk_session_id: '3cc54df8-2eae-4661-8e2c-662004a6807d',
    },
    bank_account: {
      iban: null,
      bic: null,
    },
    created_at: '2020-07-22T14:32:39+00:00',
    store_name: 'SyedaTest',
    notice_url: null,
    flash_bag: [],
    apiCall: null,
    shop_redirect_enabled: false,
    merchant_transaction_link: '',
    customer_transaction_link: '',
    callback_url: null,
  });
