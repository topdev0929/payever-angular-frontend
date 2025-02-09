import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-micro-overlay-example',
  templateUrl: './dialog-micro-overlay-example.component.html'
})
export class DialogMicroOverlayExampleComponent {

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    let dialogRef = this.dialog.open(MicroOverlayDialog, {
      autoFocus: false,
      disableClose: true,
      width: '100%',
      maxWidth: '100%',
      panelClass: ['dialog-overlay-panel', 'mat-dialog-micro', 'cdk-overlay-micro']
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

@Component({
  selector: 'micro-overlay-dialog',
  templateUrl: 'dialog.html'
})
export class MicroOverlayDialog {

  constructor(
    public dialogRef: MatDialogRef<MicroOverlayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
