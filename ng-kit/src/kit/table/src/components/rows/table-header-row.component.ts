import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CDK_ROW_TEMPLATE, CdkHeaderRow } from '@angular/cdk/table';

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'pe-table-header-row, tr[pe-table-header-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mat-header-row',
    role: 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: CdkHeaderRow, useExisting: TableHeaderRowComponent}],
  encapsulation: ViewEncapsulation.None,
})
export class TableHeaderRowComponent extends CdkHeaderRow {
}
