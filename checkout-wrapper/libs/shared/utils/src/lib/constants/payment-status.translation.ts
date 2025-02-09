import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

const PAYMENTS = { ...PaymentSpecificStatusEnum, ...PaymentStatusEnum };
type PaymentsType = typeof PAYMENTS;
export type Payment = keyof PaymentsType;

export const PAYMENT_STATUS: { [key in Payment]?: string } = {
  [PAYMENTS.STATUS_NEW]: $localize `:@@payment_status.STATUS_NEW:`,
  [PAYMENTS.STATUS_IN_PROCESS]: $localize `:@@payment_status.STATUS_IN_PROCESS:`,
  [PAYMENTS.STATUS_ACCEPTED]: $localize `:@@payment_status.STATUS_ACCEPTED:`,
  [PAYMENTS.STATUS_PAID]: $localize `:@@payment_status.STATUS_PAID:`,
  [PAYMENTS.STATUS_DECLINED]: $localize `:@@payment_status.STATUS_DECLINED:`,
  [PAYMENTS.STATUS_REFUNDED]: $localize `:@@payment_status.STATUS_REFUNDED:`,
  [PAYMENTS.STATUS_FAILED]: $localize `:@@payment_status.STATUS_FAILED:`,
  [PAYMENTS.STATUS_CANCELLED]: $localize `:@@payment_status.STATUS_CANCELLED:`,
  [PAYMENTS.STATUS_SANTANDER_IN_PROGRESS]: $localize `:@@payment_status.STATUS_SANTANDER_IN_PROGRESS:`,
  [PAYMENTS.STATUS_SANTANDER_IN_PROCESS]: $localize `:@@payment_status.STATUS_SANTANDER_IN_PROCESS:`,
  [PAYMENTS.STATUS_SANTANDER_DECLINED]: $localize `:@@payment_status.STATUS_SANTANDER_DECLINED:`,
  [PAYMENTS.STATUS_SANTANDER_APPROVED]: $localize `:@@payment_status.STATUS_SANTANDER_APPROVED:`,
  [PAYMENTS.STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS]: $localize `:@@payment_status.STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS:`,
  [PAYMENTS.STATUS_SANTANDER_DEFERRED]: $localize `:@@payment_status.STATUS_SANTANDER_DEFERRED:`,
  [PAYMENTS.STATUS_SANTANDER_CANCELLED]: $localize `:@@payment_status.STATUS_SANTANDER_CANCELLED:`,
  [PAYMENTS.STATUS_SANTANDER_AUTOMATIC_DECLINE]: $localize `:@@payment_status.STATUS_SANTANDER_AUTOMATIC_DECLINE:`,
  [PAYMENTS.STATUS_SANTANDER_IN_DECISION]: $localize `:@@payment_status.STATUS_SANTANDER_IN_DECISION:`,
  [PAYMENTS.STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY]: $localize `:@@payment_status.STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY:`,
  [PAYMENTS.STATUS_SANTANDER_IN_CANCELLATION]: $localize `:@@payment_status.STATUS_SANTANDER_IN_CANCELLATION:`,
  [PAYMENTS.STATUS_SANTANDER_ACCOUNT_OPENED]: $localize `:@@payment_status.STATUS_SANTANDER_ACCOUNT_OPENED:`,
  [PAYMENTS.STATUS_SANTANDER_CANCELLED_ANOTHER]: $localize `:@@payment_status.STATUS_SANTANDER_CANCELLED_ANOTHER:`,
  [PAYMENTS.STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED]: $localize `:@@payment_status.STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED:`,
};
