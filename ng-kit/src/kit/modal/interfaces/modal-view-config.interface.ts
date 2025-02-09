export interface ModalViewConfigInterface {
  showCloseIcon?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  classes?: {
    modal?: string;
    modalDialog?: string;
    modalContent?: string;
    modalTitle?: string;
    modalHeader?: string;
    modalBody?: string;
    modalFooter?: string;
  };
  styles?: {
    modal?: string;
    modalDialog?: string;
    modalContent?: string;
    modalTitle?: string;
    modalHeader?: string;
    modalBody?: string;
    modalFooter?: string;
  };
}
