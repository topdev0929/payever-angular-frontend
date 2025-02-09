export interface PeMessageSubscriptionDisplayOption {
  icon: string;
  title: string;
  _id: string;
}

export interface PeMessageSubscriptionIntegration {
  autoEnable: boolean;
  category: string;
  displayOptions: PeMessageSubscriptionDisplayOption;
  name: string;
  _id?: string;
}

export interface PeMessageSubscription {
  business: string;
  integration: PeMessageSubscriptionIntegration;
  enabled: boolean;
  installed: boolean;
  info?: any;
}
