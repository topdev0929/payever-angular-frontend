import { Directive, Input } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';

@Directive({
  selector: '[peTableColumnDef]',
  providers: [{provide: CdkColumnDef, useExisting: TableColumnDefDirective}]
})
export class TableColumnDefDirective extends CdkColumnDef {
  @Input('peTableColumnDef') name: string;
}
