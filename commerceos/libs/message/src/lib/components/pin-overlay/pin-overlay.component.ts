import {
  ChangeDetectionStrategy,
  Component,
  HostListener, Inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'pe-pin-dialog',
  templateUrl: './pin-overlay.component.html',
  styleUrls: ['./pin-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePinOverlayComponent {
  forAll = false;

  constructor(
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<PePinOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { name: null | string }
  ) {}

  onConfirm() {
    this.dialogRef.close(this.forAll);
  }

  onDecline() {
    this.dialogRef.close(null);
  }

  toggleLabel() {
    return this.data.name
      ? this.translateService.translate('pin-dialog.pin_for_chat') + this.data.name
      : this.translateService.translate('pin-dialog.pin_for_all');
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.onDecline();
  }
}
