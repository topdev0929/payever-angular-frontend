export interface RateOption {
  label: string;
  val: string;
}

export interface RateDetailInterface {
  id?: string;
  listTitle?: string;
  title?: string;
  lines?: string[];
  header?: string[];
  svgIconUrl?: string;
}

export interface RateAccordionDetailInterface {
  id: string;
  title: string;
  description: string;
}

export interface RateToggleExtraDurationInterface {
  duration: number;
  checked: boolean;
}
