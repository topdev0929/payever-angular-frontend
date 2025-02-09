import { PebElementDef } from './element.model';

export interface PebShape {
  id: string;
  album?: string;
  basic?: boolean;
  description?: string;
  elementKit?: any;
  elements: PebElementDef[];
  image?: string;
  screen?: string;
  tags?: string[];
  title: string;
  type?: string;
}

export interface PebShapeAlbum {
  id: string;
  name: string;
  basic: boolean;
  parent: string;
}
