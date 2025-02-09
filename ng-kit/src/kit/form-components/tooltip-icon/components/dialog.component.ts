import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogRef, DialogComponentInterface } from '../../../dialog';

@Component({
  selector: 'pe-tooltip-icon-dialog',
  templateUrl: 'dialog.component.html'
})
export class TooltipDialogComponent implements DialogComponentInterface {
  dialogRef: DialogRef<TooltipDialogComponent>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
