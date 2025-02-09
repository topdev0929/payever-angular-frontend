export interface PeBuilderSubscriptionIntegration {
  app: string;
  title: string;
}

export interface PeBuilderSubscription {
  business: string;
  integration: PeBuilderSubscriptionIntegration;
  enabled: boolean;
  installed: boolean;
  info?: any;
  authorizationId?: string;
}

export interface PeBuilderSubscriptionAll {
  authorizationId?: string,
  connected: boolean,
  integration: PeBuilderSubscriptionAllIntegration,
  info?: Object,
}

export interface PeBuilderSubscriptionAllIntegration {
  category: string,
  name: string,
}
