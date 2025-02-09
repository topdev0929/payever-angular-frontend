export enum CheckoutModeEnum {
  // Regular checkout with single payment option shown on widget click. Also called 'overlay'.
  //  But user can't finish payment, only choose payment step available
  Calculator = 'calculator',
  // Regular checkout with single payment option shown on widget click. And user can finish payment
  FinanceExpress = 'financeExpress',
  // When checkout wrapper not shown on click
  None = 'none'
}
