export interface PeBuilderHeaderMenuOptionInterface {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: string;
  options?: PeBuilderHeaderMenuOptionInterface[];
  payload?: any;
  lineAfter?: boolean;
}
