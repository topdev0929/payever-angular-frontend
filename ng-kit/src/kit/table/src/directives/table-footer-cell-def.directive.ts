import { Directive, TemplateRef } from '@angular/core';
import { CdkFooterCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[peTableFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: TableFooterCellDefDirective}]
})
export class TableFooterCellDefDirective extends CdkFooterCellDef {
  constructor(template: TemplateRef<any>) {
    super(template);
  }
}
