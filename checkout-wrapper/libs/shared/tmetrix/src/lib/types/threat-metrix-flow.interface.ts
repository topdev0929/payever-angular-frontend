export interface ThreatMetrixFlowDetailsInterface {
  channelSetId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  reference?: string;
  total?: number;
  phone?: string; // phone in billing address step
  shippingAsBillingAddress?: boolean; // when user didn't use checkbox to select different shipping address
  selectedRateMonths?: number | string;
}
