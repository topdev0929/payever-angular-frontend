export interface IconSvg {
  id: string;
  title?: string;
  size?: string;
  raw?: string;
}
export interface IconSprite {
  title: string;
  icons: IconSvg[];
}

export interface IconPngSet {
  name: string;
  prefix: string;
  classes?: string;
  icons: string[];
  sizes: IconPngSizes[];
}

export interface IconPng {
  name: string;
  src: string;
}

export interface IconPngSizes {
  size: number;
  icons?: IconPng[];
}
