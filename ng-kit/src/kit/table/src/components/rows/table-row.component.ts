import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CDK_ROW_TEMPLATE, CdkRow } from '@angular/cdk/table';

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'pe-table-row, tr[pe-table-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mat-row',
    role: 'row',
  },
  providers: [{provide: CdkRow, useExisting: TableRowComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TableRowComponent extends CdkRow {
}
