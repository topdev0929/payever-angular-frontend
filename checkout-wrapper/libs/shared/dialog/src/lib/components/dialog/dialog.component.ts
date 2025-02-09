import { Component, Input, ViewEncapsulation, InjectionToken, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { CustomElementService } from '@pe/checkout/utils';

import { DIALOG_BUTTON_PRESETS_TOKEN } from '../../constants';
import { DialogActions, DialogButtonListPresetName } from '../../enums';
import { DialogButtonListInterface, DialogButtonInterface, DialogButtonPresetsInterface } from '../../interfaces';

export const DIALOG_DATA: InjectionToken<any> = MAT_DIALOG_DATA;

@Component({
  selector: 'pe-dialog',
  templateUrl: 'dialog.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent {

  @Input() set baseButtons(buttons: DialogButtonListPresetName) {
    this.baseButtonsData = buttons;
    this.prepareActionButtons();
  }

  get baseButtons(): DialogButtonListPresetName {
    return this.baseButtonsData;
  }

  @Input() set buttons(buttons: DialogButtonListInterface) {
    this.buttonsData = buttons;
    this.prepareActionButtons();
  }

  get buttons(): DialogButtonListInterface {
    return this.buttonsData;
  }

  @Input() loading: boolean;
  @Input() hasCloseIcon: boolean;
  @Input() hasToolbar = false;
  @Input() title: string;
  @Input() noMarginBottom = false;

  orderedButtons: DialogButtonInterface[] = [];
  spinnerStrokeWidth = 2;
  spinnerDiameter = 32;

  private baseButtonsData: DialogButtonListPresetName;
  private buttonsData: DialogButtonListInterface;

  constructor(
    protected customElementService: CustomElementService,
    // NOTE: If you have 'NullInjectionError' related to MatDialogRef -
    // just check that you opening dialog via dialog service and have no attempts
    // to render any of <pe-dialog/> parent components directly in your app.
    // MatDialogRef and 2 other MatDialog-related injections only available
    // within PortalInjection inside MatDialog service.
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(DIALOG_BUTTON_PRESETS_TOKEN) private dialogButtonPresets: DialogButtonPresetsInterface
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['close-16'],
      null,
      this.customElementService.shadowRoot
    );
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
    );
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
          this.close(dialogResult);
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
        result = this.dialogButtonPresets[baseButtons];
      } else {
        throw new Error('Invalid button preset for DialogComponent!');
      }
    }

    if (buttons) {
      return [...Object.keys(result), ...Object.keys(buttons)].reduce((acc, key) => {
        acc[key] = {
          ...result[key],
          ...buttons[key],
        };

        return acc;
      }, {} as DialogButtonListInterface);
    }

    return Object.keys(result).reduce((acc, key) => {
      acc[key] = { ...result[key] };

      return acc;
    }, {} as DialogButtonListInterface);
  }

  private getOrderedButtons(buttons: DialogButtonListInterface): DialogButtonInterface[] {
    return Object.values(buttons || {}).sort((a, b) => a.order - b.order);
  }
}
