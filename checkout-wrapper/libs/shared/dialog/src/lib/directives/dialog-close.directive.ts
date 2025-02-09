import { Directive, ElementRef, Optional, Input, HostBinding, HostListener } from '@angular/core';
import { MatDialogClose, MatDialogRef, MatDialog } from '@angular/material/dialog';

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: '[dialogClose]',
  exportAs: 'dialogClose',
})
export class DialogCloseDirective extends MatDialogClose {

  /** Dialog close input. */
  @Input('dialogClose') dialogResult: any;

  @HostBinding('attr.aria-label') ariaLabel: MatDialogClose['ariaLabel'];
  @HostBinding('attr.type') type: MatDialogClose['type'] = 'button';

  constructor(
    @Optional() public dialogRefInstance: MatDialogRef<any>,
    elementRefInstance: ElementRef,
    dialogInstance: MatDialog,
  ) {
    super(dialogRefInstance, elementRefInstance, dialogInstance);
  }

  @HostListener('click') onClick(): void {
    this.dialogRefInstance.close(this.dialogResult);
  }
}
