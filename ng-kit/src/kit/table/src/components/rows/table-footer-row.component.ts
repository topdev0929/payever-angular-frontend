import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CDK_ROW_TEMPLATE, CdkFooterRow } from '@angular/cdk/table';

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'pe-table-footer-row, tr[pe-table-footer-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mat-footer-row',
    role: 'row',
  },
  providers: [{provide: CdkFooterRow, useExisting: TableFooterRowComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TableFooterRowComponent extends CdkFooterRow { }
