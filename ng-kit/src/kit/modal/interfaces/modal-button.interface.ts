export type ModalButtonFunction = () => void;

export interface ModalButtonInterface {
  title?: string;
  order?: number;
  classes?: string;
  click?: ModalButtonFunction | 'close';
  disabled?: boolean;
  dismiss?: boolean;
}

export interface ModalButtonListInterface {
  [key: string]: ModalButtonInterface;
}
