export interface OperationInterface {
  action?: string;
  forceUrl?: string;
  isSubmit?: boolean;
  isSubmitAll?: boolean;
  open?: 'self' | 'blank' | 'popup';
  width?: number;
  height?: number;
  actionData: any;
  refreshOperation?: OperationInterface; // For popup close
  request?: { // Deprecated?
    url?: string;
    method?: string;
  };
}

export interface OperationButtonInterface extends OperationInterface {
  text: string;
}
