import { peVariables } from '../../../pe-variables';
import { DialogConfigPresetsInterface } from '../interfaces';
import { DialogConfigPresetName } from '../enums';

export const DIALOG_CONFIG_PRESETS_TOKEN: string = 'DIALOG_CONFIG_PRESETS_TOKEN';

export const DIALOG_CONFIG_PRESETS: DialogConfigPresetsInterface = {
  [DialogConfigPresetName.Default]: {
    autoFocus: false,
    disableClose: true,
    panelClass: 'dialog-overlay-panel'
  },
  [DialogConfigPresetName.Small]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalSm'),
    maxWidth: peVariables.toNumber('modalSm'),
    panelClass: 'dialog-overlay-panel'
  },
  [DialogConfigPresetName.Medium]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalMd'),
    maxWidth: peVariables.toNumber('modalMd'),
    panelClass: 'dialog-overlay-panel'
  },
  [DialogConfigPresetName.Large]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalLg'),
    maxWidth: peVariables.toNumber('modalLg'),
    panelClass: 'dialog-overlay-panel'
  },
  [DialogConfigPresetName.MicroOverlay]: {
    autoFocus: false,
    disableClose: true,
    width: '100%',
    maxWidth: '100%',
    panelClass: ['dialog-overlay-panel', 'mat-dialog-micro', 'cdk-overlay-micro']
  },
  [DialogConfigPresetName.FullScreen]: {
    autoFocus: false,
    disableClose: true,
    width: '100%',
    maxWidth: '100%',
    // height: '100%',
    panelClass: ['dialog-overlay-panel', 'dialog-fullscreen']
  },
  [DialogConfigPresetName.Confirm]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalSm'),
    maxWidth: peVariables.toNumber('modalSm'),
    panelClass: ['dialog-overlay-panel', 'dialog-confirm']
  },
  [DialogConfigPresetName.TopDialogMedium]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalMd'),
    maxWidth: peVariables.toNumber('modalMd'),
    minHeight: 520,
    panelClass: ['dialog-overlay-panel', 'slide-top'],
    position: {
      top: '0px'
    }
  },
  [DialogConfigPresetName.TopDialogLarge]: {
    autoFocus: false,
    disableClose: true,
    width: peVariables.toNumber('modalLg'),
    maxWidth: peVariables.toNumber('modalLg'),
    minHeight: 520,
    panelClass: ['dialog-overlay-panel', 'slide-top'],
    position: {
      top: '0px'
    }
  }
};
