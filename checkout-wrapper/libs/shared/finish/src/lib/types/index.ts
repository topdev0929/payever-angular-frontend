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


export interface FinishStatusTranslationsInterface {
  applicationNumber: string;
  transactionDetails: string;
  transactionNumber: string;
}

export * from './abstract-finish-container.interface';
