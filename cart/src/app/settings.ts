export const PAYMENT_MICRO_KEY: string = 'cart';

export function makeStorageKey(flowId: string): string {
  return `${flowId}.${PAYMENT_MICRO_KEY}.checkout-cart.form`;
}
