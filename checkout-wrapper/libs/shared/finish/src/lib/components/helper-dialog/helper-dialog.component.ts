import { ChangeDetectorRef, Component, Inject, TemplateRef, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ModalButtonInterface } from '../../types';

export interface DataInterface {
  template: TemplateRef<any>;
  buttons?: ModalButtonInterface[];
  onClose: () => void;
}

/**
 * A common component rendered as a Material dialog. Solution taken here:
 * https://www.codegram.com/blog/playing-with-dialogs-and-ng-templates/
 */
@Component({
  selector: 'pe-helper-dialog',
  templateUrl: './helper-dialog.component.html',
  styleUrls: ['./helper-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelperDialogComponent {
  /**
   * Initializes the component.
   *
   * @param dialogRef - A reference to the dialog opened.
   */
  constructor(
    public dialogRef: MatDialogRef<HelperDialogComponent>,
    public cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DataInterface
  ) {}

  onButtonClick(button: ModalButtonInterface): void {
    if (button.click === 'close') {
      this.data.onClose();
    } else if (button.click) {
      button.click();
    }
  }
}
