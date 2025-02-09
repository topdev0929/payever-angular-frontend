export type SidebarPositionType = 'left' | 'right';
export type SidebarStyleType = 'default' | 'transparent' | 'fixed';

export interface SidebarConfig {
  position?: SidebarPositionType;
  marginTop?: string;
  marginBottom?: string;
  marginRight?: string;
  marginLeft?: string;
  paddingTop?: string;
  style?: SidebarStyleType;
  width?: string;
  zIndex?: number;
  showCloseBtn?: boolean;
  backgroundImage?: string;
  noBackgroundColor?: boolean;
  containerPaddingLeft?: string;
  containerPaddingRight?: string;
  contentPaddingLeft?: string;
  contentPaddingRight?: string;
}

export const sidebarDefaultConfig: SidebarConfig = {
  position: 'left',
  style: 'default',
  showCloseBtn: true
};

export interface Dimensions {
  width: number;
  height: number;
}

export interface SidebarClasses {
  in?: boolean;
  style?: string;
  position?: string;
  sidebar?: boolean;
}

export const sidebarClassName: string = 'ui-sidebar';
