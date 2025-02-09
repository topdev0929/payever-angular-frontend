import { ModalButtonListInterface, ModalViewConfigInterface } from '../interfaces';

interface UIModalPresetsInterface {
  buttons: {
    cancel: ModalButtonListInterface,
    cancelSave: ModalButtonListInterface,
    close: ModalButtonListInterface
    confirmCancel: ModalButtonListInterface,
    saveCancel: ModalButtonListInterface,
  };
  viewConfig: {
    confirm: ModalViewConfigInterface,
    docker: ModalViewConfigInterface
    large: ModalViewConfigInterface,
    largeBlueHeader: ModalViewConfigInterface,
    largeDefaultHeader: ModalViewConfigInterface,
    notificationWarning: ModalViewConfigInterface,
    small: ModalViewConfigInterface,
  };
}

const UI_MODAL_PRESETS: UIModalPresetsInterface = {
  buttons: {
    confirmCancel: {
      confirm: {
        title: 'Confirm',
        order: 1,
        classes: 'btn btn-primary btn-link',
        click: () => {
          throw new Error('Confirm callback is not implemented!');
        }
      },
      cancel: {
        title: 'Cancel',
        order: 2,
        classes: 'btn btn-default btn-link',
        click: 'close'
      }
    },
    saveCancel: {
      save: {
        title: 'Save',
        order: 1,
        classes: 'btn btn-primary btn-link',
        click: () => {
          throw new Error('Save callback is not implemented!');
        }
      },
      cancel: {
        title: 'Cancel',
        order: 2,
        classes: 'btn btn-default btn-link',
        click: 'close'
      }
    },
    cancel: {
      cancel: {
        title: 'Cancel',
        order: 1,
        classes: 'btn btn-default btn-link',
        click: 'close'
      }
    },
    cancelSave: {
      cancel: {
        title: 'Cancel',
        order: 1,
        classes: 'btn btn-default btn-link',
        click: 'close'
      },
      save: {
        title: 'Save',
        order: 2,
        classes: 'btn btn-primary btn-link',
        click: () => {
          throw new Error('Save callback is not implemented!');
        }
      }
    },
    close: {
      close: {
        title: 'Close',
        order: 1,
        classes: 'btn btn-default btn-link',
        click: 'close'
      }
    }
  },

  viewConfig: {
    small: {
      showCloseIcon: true,
      showHeader: false,
      showTitle: false,
      closeOnEsc: true,
      closeOnBackdrop: true,
      classes: {
        modalDialog: 'col-lg-5 col-md-6 col-sm-8 col-xs-12'
      }
    },
    confirm: {
      showCloseIcon: false,
      showHeader: false,
      showTitle: false,
      closeOnEsc: false,
      closeOnBackdrop: false,
      classes: {
        modal: 'modal-confirm',
        modalDialog: 'col-lg-5 col-md-6 col-sm-8 col-xs-12'
      }
    },
    notificationWarning: {
      showCloseIcon: true,
      showHeader: false,
      showTitle: false,
      closeOnEsc: true,
      closeOnBackdrop: true,
      classes: {
        modal: 'modal-notify notify-warning',
        modalDialog: 'col-lg-5 col-md-6 col-sm-8 col-xs-12'
      }
    },
    large: {
      showCloseIcon: true,
      showHeader: false,
      showTitle: false,
      closeOnEsc: true,
      closeOnBackdrop: true,
      classes: {
        modalDialog: 'modal-lg modal-lg-new'
      }
    },
    largeDefaultHeader: {
      showCloseIcon: true,
      showHeader: true,
      showTitle: false,
      closeOnEsc: true,
      closeOnBackdrop: true,
      classes: {
        modalDialog: 'modal-lg modal-lg-new'
      }
    },
    largeBlueHeader: {
      showCloseIcon: true,
      showHeader: true,
      showTitle: false,
      closeOnEsc: true,
      closeOnBackdrop: true,
      classes: {
        modalDialog: 'modal-lg modal-lg-new',
        modalHeader: 'modal-header-blue'
      }
    },
    docker:  {
      showCloseIcon: false,
      showHeader: false,
      showTitle: false,
      closeOnEsc: false,
      closeOnBackdrop: false,
      classes: {
        modalBody: 'modal-docker'
      }
    }
  }
};

export {
  UI_MODAL_PRESETS
};
