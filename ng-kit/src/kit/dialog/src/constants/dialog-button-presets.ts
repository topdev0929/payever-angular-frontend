import { DialogActions, DialogButtonListPresetName } from '../enums';
import { DialogButtonPresetsInterface } from '../interfaces';

export const DIALOG_BUTTON_PRESETS_TOKEN: string = 'DIALOG_BUTTON_PRESETS_TOKEN';

export const DIALOG_BUTTON_PRESETS: DialogButtonPresetsInterface = {
  [DialogButtonListPresetName.CancelConfirm]: {
    cancel: {
      order: 1,
      classes: 'pe-dialog-cancel-button',
      text: 'ng_kit.dialog.action_buttons.cancel',
      click: DialogActions.Dismiss
    },
    confirm: {
      classes: 'mat-button-bold pe-dialog-confirm-button',
      click: DialogActions.Success,
      color: 'primary',
      order: 2,
      text: 'ng_kit.dialog.action_buttons.confirm'
    }
  },
  [DialogButtonListPresetName.CancelSave]: {
    cancel: {
      classes: 'pe-dialog-cancel-button',
      text: 'ng_kit.dialog.action_buttons.cancel',
      order: 1,
      click: DialogActions.Dismiss
    },
    save: {
      classes: 'mat-button-bold pe-dialog-save-button',
      click: DialogActions.Success,
      color: 'primary',
      order: 2,
      text: 'ng_kit.dialog.action_buttons.save'
    }
  },
  [DialogButtonListPresetName.CancelAdd]: {
    cancel: {
      classes: 'pe-dialog-cancel-button',
      text: 'ng_kit.dialog.action_buttons.cancel',
      order: 1,
      click: DialogActions.Dismiss
    },
    save: {
      classes: 'mat-button-bold pe-dialog-save-button',
      click: DialogActions.Success,
      color: 'primary',
      order: 2,
      text: 'ng_kit.dialog.action_buttons.add'
    }
  },
  [DialogButtonListPresetName.NoYes]: {
    no: {
      classes: 'pe-dialog-no-button',
      text: 'ng_kit.dialog.action_buttons.no',
      order: 1,
      click: DialogActions.Dismiss
    },
    yes: {
      classes: 'mat-button-bold pe-dialog-yes-button',
      click: DialogActions.Success,
      color: 'primary',
      order: 2,
      text: 'ng_kit.dialog.action_buttons.yes'
    }
  },
  [DialogButtonListPresetName.Cancel]: {
    cancel: {
      classes: 'pe-dialog-cancel-button',
      click: DialogActions.Dismiss,
      order: 1,
      text: 'ng_kit.dialog.action_buttons.cancel'
    }
  },
  [DialogButtonListPresetName.Close]: {
    close: {
      classes: 'pe-dialog-close-button',
      click: DialogActions.Close,
      order: 1,
      text: 'ng_kit.dialog.action_buttons.close'
    }
  }
};
