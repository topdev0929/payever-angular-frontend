import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'pe-warning-snackbar',
  templateUrl: './warning-snackbar.component.html',
  styleUrls: ['./warning-snackbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarningSnackbarComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return 'auto';
  }

  constructor(
    public snackBarRef: MatSnackBarRef<WarningSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {}
}
