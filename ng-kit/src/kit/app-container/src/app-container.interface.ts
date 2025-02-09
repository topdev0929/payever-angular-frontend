export interface AppContainerItem {
  id: string;
  title: string;
  onSelect?: ( event: MouseEvent, item: AppContainerItem ) => void;
}

export interface AppContainerLayoutItem {
  slidesPerView?: number;
  slidesPerColumn?: number;
  slidesPerGroup?: number;
}

export interface AppContainerLayout {
  desktop: AppContainerLayoutItem;
  mobile: AppContainerLayoutItem;
}
