import { Overlay } from '@angular/cdk/overlay';
import { Injectable, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig, MatDialogState } from '@angular/material/dialog';

import { PaymentHelperService } from '@pe/checkout/utils';

import { HelperDialogComponent } from '../components';
import { ModalButtonInterface } from '../types';

@Injectable()
export class FinishDialogService {

  private dialogRef: MatDialogRef<HelperDialogComponent> = null;
  private isDisableHideOnNextNavigate = false;
  private overlay = inject(Overlay);

  constructor(
    private matDialog: MatDialog,
    private paymentHelperService: PaymentHelperService,
  ) {}

  disableHideOnNextNavigate(): void {
    this.isDisableHideOnNextNavigate = true;
  }

  close(): void {
    if (this.isDisableHideOnNextNavigate) {
      this.isDisableHideOnNextNavigate = false;

      return;
    }
    this.paymentHelperService.openEmbedFinish$.next(false);
    this.dialogRef?.getState() === MatDialogState.OPEN && this.dialogRef.close();
    this.dialogRef = null;
  }

  open(
    template: TemplateRef<any>,
    buttons: ModalButtonInterface[],
    onClose: () => void
  ): MatDialogRef<HelperDialogComponent> {

    if (this.dialogRef?.componentInstance?.data) {
      this.dialogRef.componentInstance.data.template = template;

      return this.dialogRef;
    }

    const matConfig: MatDialogConfig = {
      autoFocus: false,
      disableClose: true,
      panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-checkout-finish-modal-panel'],
      backdropClass: [
        'pe-checkout-finish-modal-backdrop',
        'cdk-overlay-backdrop',
        'cdk-overlay-dark-backdrop',
        'cdk-overlay-backdrop-showing',
      ] as any,
      data: {
        template: template,
        buttons: buttons,
        onClose: onClose,
      },
      scrollStrategy: this.overlay.scrollStrategies.block(),
    };

    const matRef: MatDialogRef<HelperDialogComponent> = this.matDialog.open(HelperDialogComponent, matConfig);

    this.dialogRef = matRef;

    return matRef;
  }

  updateButtons(buttons: ModalButtonInterface[]): void {
    if (this.dialogRef?.componentInstance?.data) {
      this.dialogRef.componentInstance.data.buttons = buttons;
      this.dialogRef.componentInstance.cdr.detectChanges();
    }
  }
}
