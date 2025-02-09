import { Component, HostBinding, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { ContactsSnackbarData } from './snackbar.interface';

@Component({
  selector: 'contacts-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class ContactsSnackbarComponent {

  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }

  constructor(
    public snackBarRef: MatSnackBarRef<ContactsSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: ContactsSnackbarData,
  ) {}

}
