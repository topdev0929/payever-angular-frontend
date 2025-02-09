import { Directive, ElementRef } from '@angular/core';
import { MatFooterCell } from '@angular/material/table';
import { CdkColumnDef } from '@angular/cdk/table';

@Directive({
  selector: 'pe-table-footer-cell, td[pe-table-footer-cell]',
  host: {
    'class': 'mat-footer-cell',
    'role': 'gridcell',
  },
})
export class TableFooterCellDirective extends MatFooterCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`pe-column-${columnDef.cssClassFriendlyName}`);
  }
}
