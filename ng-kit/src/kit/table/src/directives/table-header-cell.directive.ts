import { Directive, ElementRef } from '@angular/core';
import { MatHeaderCell } from '@angular/material/table';
import { CdkColumnDef } from '@angular/cdk/table';

@Directive({
  selector: 'pe-table-header-cell, th[pe-table-header-cell]',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader'
  }
})
export class TableHeaderCellDirective extends MatHeaderCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`pe-column-${columnDef.cssClassFriendlyName}`);
  }
}
