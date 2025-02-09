import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { DialogData, DialogDataExampleDialogComponent } from './dialog-data.component';

@Injectable()
export class ConfirmDialogService {
  private dialogRef: MatDialogRef<DialogDataExampleDialogComponent>;

  constructor(private dialog: MatDialog) {
  }

  public open(options: DialogData): void {
    this.dialogRef = this.dialog.open(DialogDataExampleDialogComponent, {
      disableClose: true,
      panelClass: 'my-panel',
      data: options,
    });
  }

  public onConfirmClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => !data?.cancel),
    );
  }

  public closeDialog(): void {
    this.dialog.closeAll();
  }
}
