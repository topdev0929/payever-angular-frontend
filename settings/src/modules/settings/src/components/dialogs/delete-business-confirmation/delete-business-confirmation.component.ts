import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs/internal/operators';
import { ApiService } from '../../../services';
import { AbstractComponent } from '../../abstract';

@Component({
  selector: 'peb-delete-business-confirmation',
  templateUrl: './delete-business-confirmation.component.html',
  styleUrls: ['./delete-business-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteBusinessConfirmationComponent extends AbstractComponent {
  showLoader = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private businessId: string,
    private dialogRef: MatDialogRef<DeleteBusinessConfirmationComponent>,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  continue() {
    if (this.showLoader) {
      return;
    }
    this.showLoader = true;
    this.cdr.detectChanges();

    this.apiService.deleteBusiness(this.businessId).pipe(
      finalize(() => {this.showLoader = false; this.cdr.detectChanges(); }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.dialogRef.close({deleted: true});
    });
  }

  back() {
    if (this.showLoader) {
      return;
    }

    this.dialogRef.close({deleted: false});
  }
}
