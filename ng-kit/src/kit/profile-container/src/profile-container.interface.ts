export type ProfileContainerItemType = 'business' | 'private' | 'partner';
export type ProfileContainerThemeType = 'dark' | 'light';

export interface SelectedProfileContainerItem {
  event: MouseEvent;
  item: ProfileContainerItem;
}

export interface ProfileContainerItem {
  id: number;
  title: string;
  abbr?: string;
  type?: ProfileContainerItemType;
  typeText?: string;
  imagePath?: string;
  active?: boolean;
  onSelect?: ( event: MouseEvent, item: ProfileContainerItem ) => void;
}

export interface ProfileContainerLayoutItem {
  slidesPerView?: number;
  slidesPerColumn?: number;
  slidesPerGroup?: number;
}

export interface ProfileContainerLayout {
  desktop: ProfileContainerLayoutItem;
  mobile: ProfileContainerLayoutItem;
}
