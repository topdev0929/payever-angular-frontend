export const DOMAIN_CREATED_EVENT_NAME: string = 'builder.event.domain.created';
export const DOMAIN_REMOVED_EVENT_NAME: string = 'builder.event.domain.removed';
export const DOMAIN_UPDATED_EVENT_NAME: string = 'builder.event.domain.updated';

export const BUILDER_APP_THEME_PUBLISHED: string = 'builder.event.application-theme.published';
export const SHOP_LIVE_TOGGLED: string = 'shops.event.shop.live-toggled';

export const BUILDER_ROUTING_KEYS: string[] = [
  BUILDER_APP_THEME_PUBLISHED,
  'builder.event.business-theme.installed',
  'builder.event.template-theme.installed'
];

export const SHOP_ROUTING_KEYS: string[] = [
  SHOP_LIVE_TOGGLED
];

export const DOMAIN_ROUTING_KEYS: string[] = [
  DOMAIN_CREATED_EVENT_NAME,
  DOMAIN_REMOVED_EVENT_NAME,
  DOMAIN_UPDATED_EVENT_NAME,
];
