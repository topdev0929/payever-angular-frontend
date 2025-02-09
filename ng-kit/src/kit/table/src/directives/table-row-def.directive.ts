import { Directive, IterableDiffers, TemplateRef } from '@angular/core';
import { CdkRowDef } from '@angular/cdk/table';

/**
 * Data row definition for the mat-table.
 * Captures the footer row's template and other footer properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
@Directive({
  selector: '[peTableRowDef]',
  providers: [{provide: CdkRowDef, useExisting: TableRowDefDirective}],
  inputs: ['columns: peTableRowDefColumns', 'when: peTableRowDefWhen'],
})
export class TableRowDefDirective<T> extends CdkRowDef<T> {
  constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
    super(template, _differs);
  }
}
