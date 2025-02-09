import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { DialogData, DialogDataExampleDialogComponent } from './dialog-data.component';

@Injectable()
export class ConfirmDialogService {
  private dialogRef: MatDialogRef<DialogDataExampleDialogComponent>;

  constructor(private dialog: MatDialog) {}

  public open(options: DialogData) {
    this.dialogRef = this.dialog.open(DialogDataExampleDialogComponent, {
      disableClose: true,
      panelClass: 'my-panel',
      width: '540px',
      data: {
        title: options.title,
        subtitle: options.subtitle,
        cancelButtonTitle: options.cancelButtonTitle,
        confirmButtonTitle: options.confirmButtonTitle,
      },
    });
  }
  public onCancelClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => data?.cancel),
    );
  }

  public onConfirmClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => !data?.cancel),
    );
  }

  public closeDialog() {
    this.dialog.closeAll();
  }
}
