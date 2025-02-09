import { Inject, Injectable, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { DialogRef } from '../classes';
import { DIALOG_CONFIG_PRESETS_TOKEN } from '../constants';
import { DialogConfigPresetName } from '../enums';
import { DialogComponentInterface, DialogConfigPresetsInterface } from '../interfaces';
import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';

@Injectable()
export class DialogService {

  afterAllClosed: Observable<void>;
  afterOpen: Observable<DialogRef<any>>;
  openedDialogs: DialogRef<any>[] = [];

  constructor(
    private matDialog: MatDialog,
    @Inject(DIALOG_CONFIG_PRESETS_TOKEN) private dialogConfigPresets: DialogConfigPresetsInterface
  ) {
    this.afterAllClosed = matDialog.afterAllClosed;

    this.afterOpen = matDialog.afterOpened
      .pipe(
        map((matDialogRef: MatDialogRef<any>) =>
          this.openedDialogs.find(
            (dialogRef: DialogRef<any>) => dialogRef.id === matDialogRef.id
          )
        )
      );
  }

  closeAll(): void {
    this.matDialog.closeAll();
  }

  getDialogById(id: string): DialogRef<any> {
    return this.openedDialogs.find((dialogRef: DialogRef<any>) => dialogRef.id === id);
  }

  open<T extends DialogComponentInterface<R>, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    configPresetName?: DialogConfigPresetName,
    data?: D
  ): DialogRef<T, R> {

    configPresetName = configPresetName || DialogConfigPresetName.Default;
    const matConfig: MatDialogConfig = this.dialogConfigPresets[String(configPresetName)];

    // TODO Check other presets
    const allowMobileFullscreen: boolean = [DialogConfigPresetName.Default, DialogConfigPresetName.FullScreen].indexOf(configPresetName) >= 0;

    matConfig.id = matConfig.id || this.generateDialogUUID();
    matConfig.data = data;
    const fullsceenClass: string = allowMobileFullscreen ? 'cdk-overlay-pane-for-mobile-fullscreen-dialog' : '';

    if (typeof matConfig.panelClass === 'string') {
      matConfig.panelClass = [ matConfig.panelClass ];
    }

    if (fullsceenClass) {
      matConfig.panelClass.push(fullsceenClass);
    }
    matConfig.panelClass.push('pe-bootstrap');

    const matRef: MatDialogRef<T, R> = this.matDialog.open(componentOrTemplateRef, matConfig);
    const dialogRef: DialogRef<T, R> = new DialogRef(matRef);

    this.addOpenedDialog(dialogRef);
    disableBodyScroll(document.querySelector('.mat-dialog-content-wrapper'));
    dialogRef.afterClosed()
      .subscribe(() => {
        this.handleCustomClasses(configPresetName, false);
        this.removeOpenedDialog(dialogRef);
        clearAllBodyScrollLocks();
      });

    this.handleCustomClasses(configPresetName, true);
    return dialogRef;
  }

  private addOpenedDialog<T extends DialogComponentInterface<R>, R>(dialogRef: DialogRef<T, R>): void {
    this.openedDialogs.push(dialogRef);
  }

  private handleCustomClasses(configPresetName: DialogConfigPresetName, open: boolean): void {
    if ([ DialogConfigPresetName.TopDialogLarge, DialogConfigPresetName.TopDialogMedium ].indexOf(configPresetName) > -1) {
      // get <html> element because Mat Dialog add class directly to it
      const htmlEl: HTMLElement = window.document.getElementsByTagName('html')[0];
      if (open) {
        htmlEl.classList.add('pe-top-dialog');
      } else {
        htmlEl.classList.remove('pe-top-dialog');
      }
    }
  }

  private removeOpenedDialog<T extends DialogComponentInterface<R>, R>(dialogRef: DialogRef<T, R>): void {
    const index: number = this.openedDialogs.indexOf(dialogRef);
    if (index !== -1) {
      this.openedDialogs.splice(index, 1);
    }
  }

  private generateDialogUUID(): string {
    return `dialog-${uuidv4()}`;
  }
}
