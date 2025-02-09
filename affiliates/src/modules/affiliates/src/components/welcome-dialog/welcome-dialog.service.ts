import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { PebWelcomeDialogComponent } from './welcome-dialog.component';

@Injectable()
export class WelcomeDialogService {
  private dialogRef: MatDialogRef<PebWelcomeDialogComponent>;

  constructor(private dialog: MatDialog) {}

  public open() {
    this.dialogRef = this.dialog.open(PebWelcomeDialogComponent, {
      disableClose: true,
      panelClass: 'my-panel',
    });
  }
  public onGetStartClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => data?.cancel),
    );
  }

  public onBackDashboardClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => !data?.cancel),
    );
  }

  public closeDialog() {
    this.dialog.closeAll();
  }
}
