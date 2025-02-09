import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  message: string;

  constructor(private snackBar: MatSnackBar) {}

  open(component: ComponentType<any>, message: string, horizontalPosition: MatSnackBarHorizontalPosition = 'center'): void {
    this.message = message;
    this.snackBar.openFromComponent(component, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition,
      panelClass: 'snackbar-builder',
    });
  }

  close(): void {
    this.snackBar.dismiss();
  }
}
