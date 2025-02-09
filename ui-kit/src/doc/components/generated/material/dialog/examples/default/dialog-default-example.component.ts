import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { peVariables } from '../../../../../../../../scss/pe-variables';

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'dialog-default-example',
  templateUrl: './dialog-default-example.component.html'
})
export class DialogDefaultExampleComponent {

  animal: string;
  name: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogExampleDialog, {
      minWidth: peVariables.toNumber('modalSm'),
      maxWidth: peVariables.toNumber('modalSm'),
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

}

@Component({
  selector: 'dialog-example-dialog',
  templateUrl: './dialog-example-dialog.html'
})
export class DialogExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
