import { Directive, IterableDiffers, TemplateRef } from '@angular/core';
import { CdkFooterRowDef } from '@angular/cdk/table';

/**
 * Footer row definition for the mat-table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
@Directive({
  selector: '[peTableFooterRowDef]',
  providers: [{provide: CdkFooterRowDef, useExisting: TableFooterRowDefDirective}],
  inputs: ['columns: peTableFooterRowDef'],
})
export class TableFooterRowDefDirective extends CdkFooterRowDef {
  constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
    super(template, _differs);
  }
}
