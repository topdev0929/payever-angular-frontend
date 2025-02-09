import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppThemeEnum } from '@pe/common';
import { ApiService, BusinessEnvService } from '../../../services';
import { AbstractComponent } from '../../abstract';

@Component({
  selector: 'peb-exit-window-confirmation',
  templateUrl: './exit-confirm.component.html',
  styleUrls: ['./exit-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseWindowsConfirmationComponent extends AbstractComponent {
  theme = this.businessEnvService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  showLoader = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private businessId: string,
    private dialogRef: MatDialogRef<CloseWindowsConfirmationComponent>,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private businessEnvService: BusinessEnvService,
  ) {
    super();
  }

  continue() {
    if (this.showLoader) {
      return;
    }
    this.showLoader = true;
    this.cdr.detectChanges();

    this.dialogRef.close({exit: true});
  }

  back() {
    if (this.showLoader) {
      return;
    }

    this.dialogRef.close({exit: false});
  }
}
