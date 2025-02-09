export interface ConfirmationDialogConfig {
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  title?: string;
  message?: string;
  dialogClasses?: string;
}

// TODO: add i18n support
export const confirmationDialogDefaultConfig: ConfirmationDialogConfig = {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showCancel: true,
  title: 'Confirmation required',
  message: 'Are you sure?',
  dialogClasses: 'col-lg-5 col-md-6 col-sm-8 col-xs-12'
};
