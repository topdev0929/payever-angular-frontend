import { RateInterface } from '../../shared';

export function getPaymentPeriod(creditOption: RateInterface): number {
  return creditOption?.payLaterType
    ? creditOption?.parameters?.loanDurationInMonths + creditOption?.result?.paymentFreeDuration
    : creditOption?.parameters?.loanDurationInMonths;
}
