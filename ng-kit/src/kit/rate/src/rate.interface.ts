export interface RateOption {
  label: string;
  val: string;
}

export interface RateDetailInterface {
  id: string;
  listTitle?: string;
  title: string;
  lines: string[];
}

export interface RateAccordionDetailInterface {
  id: string;
  title: string;
  description: string;
}
