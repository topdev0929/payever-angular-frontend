export interface AppInterface {
  description?: string;
  enabled?: boolean;
  hasUnreadMessages?: boolean;
  id?: number;
  image?: string;
  image_description?: string;
  image_mac?: string;
  image_mobile?: string;
  image_tablet?: string;
  integration_description?: string;
  integration_header?: string;
  internal?: boolean;
  intro_shown?: boolean;
  is_configured?: boolean;
  label: string;
  last_opened?: Date;
  location?: string;
  name?: string;
  position?: number;
  priority?: number;
  routerLink?: string[];
  url?: string;
}
