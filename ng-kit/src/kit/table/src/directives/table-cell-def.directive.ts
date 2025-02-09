import { Directive, TemplateRef } from '@angular/core';
import { CdkCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[peTableCellDef]',
  providers: [{provide: CdkCellDef, useExisting: TableCellDefDirective}]
})
export class TableCellDefDirective extends CdkCellDef {
  constructor(template: TemplateRef<any>) {
    super(template);
  }
}
