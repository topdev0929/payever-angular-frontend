import { Directive, ElementRef } from '@angular/core';
import { CdkCell, CdkColumnDef } from '@angular/cdk/table';

@Directive({
  selector: 'pe-table-cell, td[pe-table-cell]',
  host: {
    'class': 'mat-cell',
    'role': 'gridcell',
  },
})
export class TableCellDirective extends CdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`pe-table-column-${columnDef.cssClassFriendlyName}`);
  }
}
