import { AfterViewInit, Component, inject } from '@angular/core';

import { DialogComponentInterface, DialogRef, DIALOG_DATA } from '@pe/checkout/dialog';
import { CustomElementService } from '@pe/checkout/utils';


export interface ConfirmDialogOverlayData {
  requirementsTitle: string
  requirements: string[]
  header: {
    title: string,
    subtitle: string,
  }
  confirmBtnText: string
  actions: {
    confirm: () => void,
    skip?: () => void,
  }
}

@Component({
  selector: 'santander-de-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements DialogComponentInterface, AfterViewInit {
  private customElementService = inject(CustomElementService);
  public dialogRef: DialogRef<ConfirmDialogComponent>;
  public data: ConfirmDialogOverlayData = inject(DIALOG_DATA);

  ngAfterViewInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['checkbox-checked-24'],
      null,
      this.customElementService.shadowRoot
    );
  }

  onClicked() {
    this.data.actions.confirm();
    this.dialogRef.close();
  }

  onSkip() {
    this.data.actions.skip?.();
    this.dialogRef.close();
  }
}
