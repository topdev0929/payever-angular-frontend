import { Directive, TemplateRef } from '@angular/core';
import { CdkHeaderCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[peHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: TableHeaderCellDefDirective}]
})
export class TableHeaderCellDefDirective extends CdkHeaderCellDef {
  constructor(template: TemplateRef<any>) {
    super(template);
  }
}
