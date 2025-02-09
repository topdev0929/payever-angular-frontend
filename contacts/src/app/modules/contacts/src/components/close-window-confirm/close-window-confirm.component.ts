import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PeDataGridTheme } from '@pe/common';

@Component({
  selector: 'peb-exit-window-confirmation',
  templateUrl: './close-window-confirm.component.html',
  styleUrls: ['./close-window-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CloseWindowsConfirmationComponent {
  theme = PeDataGridTheme.Dark;
  showLoader = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private businessId: string,
    private dialogRef: MatDialogRef<CloseWindowsConfirmationComponent>,
    private cdr: ChangeDetectorRef,
  ) {
  }

  continue(): void {
    if (this.showLoader) {
      return;
    }
    this.showLoader = true;
    this.cdr.detectChanges();

    this.dialogRef.close({ exit: true });
  }

  back(): void {
    if (this.showLoader) {
      return;
    }

    this.dialogRef.close({ exit: false });
  }
}
