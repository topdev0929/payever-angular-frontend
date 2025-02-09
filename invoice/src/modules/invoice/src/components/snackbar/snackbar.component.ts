import { Component, HostBinding, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

interface PebInvoiceSnackbarDataInterface {
  width?: string;
  icon?: string;
  text?: string;
}

@Component({
  selector: 'peb-Invoice-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class PebInvoiceSnackbarComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }

  constructor(
    public snackBarRef: MatSnackBarRef<PebInvoiceSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: PebInvoiceSnackbarDataInterface,
  ) {}
}
