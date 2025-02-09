import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogPositionInterface, DialogComponentInterface } from '../interfaces';

export class DialogRef<T extends DialogComponentInterface, R = any> {

  /** The instance of component opened into the dialog. */
  get componentInstance(): T {
    return this.matDialogRef.componentInstance;
  }

  /** Whether the user is allowed to close the dialog. */
  get disableClose(): boolean | undefined {
    return this.matDialogRef.disableClose;
  }
  set disableClose(isDisableClose: boolean) {
    this.matDialogRef.disableClose = isDisableClose;
  }

  get id(): string {
    return this.matDialogRef.id;
  }

  private matDialogRef: MatDialogRef<T, R>;

  constructor(dialog: MatDialogRef<T, R>) {
    this.matDialogRef = dialog;
    this.componentInstance.dialogRef = this;
  }

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  afterClosed(): Observable<R | undefined> {
    return this.matDialogRef.afterClosed();
  }

  /**
   * Gets an observable that is notified when the dialog is finished opening.
   */
  afterOpen(): Observable<void> {
    return this.matDialogRef.afterOpened();
  }

  /**
   * Gets an observable that is notified when the dialog has started closing.
   */
  beforeClose(): Observable<R | undefined> {
    return this.matDialogRef.beforeClosed();
  }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: R): void {
    this.matDialogRef.close(dialogResult);
  }

  /**
   * Updates the dialog's position.
   * @param position New dialog position.
   */
  updatePosition(position?: DialogPositionInterface): DialogRef<T, R> {
    this.matDialogRef.updatePosition(position);
    return this;
  }

  /**
   * Updates the dialog's width and height.
   * @param width New width of the dialog.
   * @param height New height of the dialog.
   */
  updateSize(width?: string, height?: string): DialogRef<T, R> {
    this.matDialogRef.updateSize(width, height);
    return this;
  }
}
