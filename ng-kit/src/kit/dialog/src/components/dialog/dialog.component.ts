import { Component, Input, ViewEncapsulation, InjectionToken, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { merge, cloneDeep, values } from 'lodash-es';
import { take } from 'rxjs/operators';

import { peVariables } from '../../../../pe-variables';
import { DIALOG_BUTTON_PRESETS_TOKEN } from '../../constants';
import { DialogActions, DialogButtonListPresetName } from '../../enums';
import { DialogButtonListInterface, DialogButtonInterface, DialogButtonPresetsInterface } from '../../interfaces';

export const DIALOG_DATA: InjectionToken<any> = MAT_DIALOG_DATA;

@Component({
  selector: 'pe-dialog',
  templateUrl: 'dialog.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent {

  @Input() set baseButtons(buttons: DialogButtonListPresetName) {
    this._baseButtons = buttons;
    this.prepareActionButtons();
  }
  get baseButtons(): DialogButtonListPresetName {
    return this._baseButtons;
  }

  @Input() set buttons(buttons: DialogButtonListInterface) {
    this._buttons = buttons;
    this.prepareActionButtons();
  }
  get buttons(): DialogButtonListInterface {
    return this._buttons;
  }
  @Input() loading: boolean;
  @Input() hasCloseIcon: boolean;
  @Input() hasToolbar: boolean = false;
  @Input() title: string;

  orderedButtons: DialogButtonInterface[] = [];
  spinnerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  spinnerDiameter: number = peVariables.toNumber('spinnerStrokeSm');

  private _baseButtons: DialogButtonListPresetName;
  private _buttons: DialogButtonListInterface;

  constructor(
    // NOTE: If you have 'NullInjectionError' related to MatDialogRef -
    // just check that you opening dialog via dialog service and have no attempts
    // to render any of <pe-dialog/> parent components directly in your app.
    // MatDialogRef and 2 other MatDialog-related injections only available
    // within PortalInjection inside MatDialog service.
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(DIALOG_BUTTON_PRESETS_TOKEN) private dialogButtonPresets: DialogButtonPresetsInterface
  ) {
  }

  processButtonClick(button: DialogButtonInterface): void {
    if (typeof button.click === 'function') {
      button.click();
    } else {
      this.applyButtonClickAction(button);
    }
  }

  isButtonDisabled(button: DialogButtonInterface): boolean {
    return (
      button.disabled
      || (this.loading
          && button.click !== DialogActions.Dismiss
          && button.click !== DialogActions.Close)
      ) ? true : false;
  }

  close(reason?: any): void {
    if (this.dialogRef) {
      this.dialogRef.close(reason);
    }
  }

  private applyButtonClickAction(button: DialogButtonInterface): void {
    switch (button.click) {
      case DialogActions.Close: {
        if (button.dialogResult) {
          let dialogResult: any;
          button.dialogResult.pipe(take(1)).subscribe((result: any) => {
            dialogResult = result;
          });
          this.close(dialogResult ? dialogResult : undefined);
        } else {
          this.close();
        }
        break;
      }

      case DialogActions.Dismiss: {
        this.close(false);
        break;
      }

      case DialogActions.Success: {
        this.close(true);
        break;
      }

      default: break;
    }
  }

  private prepareActionButtons(): void {
    const mergedButtons: DialogButtonListInterface = this.getMergedButtons(this.buttons, this.baseButtons);
    this.orderedButtons = this.getOrderedButtons(mergedButtons);
  }

  private getMergedButtons(
    buttons: DialogButtonListInterface,
    baseButtons: DialogButtonListPresetName
  ): DialogButtonListInterface {
    let result: DialogButtonListInterface = {};
    if (baseButtons) {
      if (this.dialogButtonPresets[baseButtons]) {
        result = cloneDeep(this.dialogButtonPresets[baseButtons]);
      } else {
        throw new Error('Invalid button preset for DialogComponent!');
      }
    }
    merge(result, buttons || {});
    return result;
  }

  private getOrderedButtons(buttons: DialogButtonListInterface): DialogButtonInterface[] {
    return values(buttons).sort((a, b) => a.order - b.order);
  }
}
