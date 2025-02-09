export interface CardsContainerItem {
  id: string;
  title: string;
  subtitle?: string;
  imagePath?: string;
  logoPath?: string;
  abbr?: string;
  actions?: CardsContainerItemActions[];
  onSelect?: ( event: MouseEvent, item: CardsContainerItem ) => void;
}

export interface CardsContainerItemActions {
  title: string;
  onSelect?: ( event: MouseEvent, item: CardsContainerItem, action: CardsContainerItemActions ) => void;
}

export interface CardsContainerLayout {
    desktop: CardsContainerLayoutItem;
    tablet: CardsContainerLayoutItem;
    mobile: CardsContainerLayoutItem;
}

export interface CardsConfig {
    add: string;
    empty: string;
    addSelect?: (event: MouseEvent) => void;
}

export interface CardsContainerLayoutItem {
  slidesPerView?: number;
  slidesPerColumn?: number;
  slidesPerGroup?: number;
}
