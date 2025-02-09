import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  subtitle: string;
  cancelButtonTitle: string;
  confirmButtonTitle: string;
}

/**
 * @title Injecting data when opening a dialog
 */

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data.component.html',
  styleUrls: ['./dialog-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogDataExampleDialogComponent {
  @Output() cancelClick = new EventEmitter();
  @Output() confirmClick  = new EventEmitter();
  @Input() icon  = 'icon-alert-24';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<DialogDataExampleDialogComponent>,
  ) {}

  onCancelClick(): void {
    this.cancelClick.emit();
    this.dialogRef.close({
      cancel: true,
    });
  }
  onConfirmClick(): void {
    this.confirmClick.emit();
    this.dialogRef.close({
      cancel: false,
    });
  }
  @HostListener('keydown.esc')
  public onEsc() {
    this.onCancelClick();
  }
}
