import { Directive, ElementRef, Optional, Input } from '@angular/core';
import { MatDialogClose, MatDialogRef, MatDialog } from '@angular/material/dialog';

/**
 * Button that will close the current dialog.
 */
@Directive({
    selector: '[dialogClose]',
    exportAs: 'dialogClose',
    host: {
      '(click)': 'dialogRef.close(dialogResult)',
      '[attr.aria-label]': 'ariaLabel',
      type: 'button', // Prevents accidental form submits.
    }
  })
export class DialogCloseDirective extends MatDialogClose {

  /** Dialog close input. */
  @Input('dialogClose') dialogResult: any;

  constructor(
    @Optional() public dialogRefInstance: MatDialogRef<any>,
    elementRefInstance: ElementRef,
    dialogInstance: MatDialog
  ) {
    super(dialogRefInstance, elementRefInstance, dialogInstance);
  }
}
