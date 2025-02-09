import { Widget } from './widget';

export interface OverlayApp {
  configured: boolean;
  description: string;
  display: 'desktop' | 'mobile' | 'desktop_and_mobile';
  id: number;
  image: string;
  label: string;
  name: string;
  settings: Widget[];
  url: string;
}
