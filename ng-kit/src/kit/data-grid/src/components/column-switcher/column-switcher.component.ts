import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DataGridTableColumnInterface } from '../../interfaces';

@Component({
  selector: 'pe-data-grid-column-switcher',
  templateUrl: 'column-switcher.component.html',
  styleUrls: ['./column-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridColumnSwitcherComponent {

  @Input() columns: DataGridTableColumnInterface[] = [];
  @Input() isShowArrow: boolean = true;
  @Input() title: string;

  @Output() columnsChanged: EventEmitter<DataGridTableColumnInterface[]> = new EventEmitter<DataGridTableColumnInterface[]>();

  get shownColumns(): DataGridTableColumnInterface[] {
    return this.columns
      .filter((column: DataGridTableColumnInterface) => Boolean(column.title) && column.isToggleable );
  }

  onColumnClick(column: DataGridTableColumnInterface): void {
    const columnsClone: DataGridTableColumnInterface[] = this.columns.slice();
    columnsClone.find((columnClone: DataGridTableColumnInterface) => {
      return columnClone.name === column.name;
    }).isActive = !column.isActive;
    this.columnsChanged.emit(columnsClone);
  }

}
