import { CdkHeaderRowDef } from '@angular/cdk/table';
import { Directive, IterableDiffers, TemplateRef } from '@angular/core';

/**
 * Header row definition for the mat-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[peTableHeaderRowDef]',
  providers: [{provide: CdkHeaderRowDef, useExisting: TableHeaderRowDefDirective}],
  inputs: ['columns: peTableHeaderRowDef'],
})
export class TableHeaderRowDefDirective extends CdkHeaderRowDef {
  constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
    super(template, _differs);
  }
}
