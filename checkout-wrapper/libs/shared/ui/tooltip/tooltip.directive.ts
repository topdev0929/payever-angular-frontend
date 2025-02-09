import { Directive, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TooltipDialogComponent } from './tooltip-dialog.component';

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective {

  @Input() tooltip: string;

  constructor(
    private matDialog: MatDialog,
  ) {}

  @HostListener('click', ['$event']) onClick(event: MouseEvent): void {
    event.stopPropagation();

    this.matDialog.open(
      TooltipDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        data: {
          text: this.tooltip,
        },
      },
    );
  }
}
