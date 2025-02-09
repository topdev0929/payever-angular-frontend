import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DataViewModeType, DataGridTableColumnInterface } from '../../interfaces';

@Component({
  selector: 'pe-data-grid-toolbar',
  templateUrl: 'toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridToolbarComponent {

  dataViewMode: typeof DataViewModeType = DataViewModeType;

  @Input() columns: DataGridTableColumnInterface[] = [];
  @Input() viewMode: DataViewModeType = this.dataViewMode.List;
  @Input() showViewSwitcher: boolean = true;
  @Input() showColumnSwitcher: boolean = true;
  @Input() showSearchBar: boolean = true;
  @Input() searchValue: string = '';
  @Input() isShowColumnSwitcherArrow: boolean = true;
  @Input() columnSwitcherTitle: string;

  @Output() viewChanged: EventEmitter<DataViewModeType> = new EventEmitter<DataViewModeType>();
  @Output() columnsChanged: EventEmitter<DataGridTableColumnInterface[]> = new EventEmitter<DataGridTableColumnInterface[]>();
  @Output() inputSearch: EventEmitter<string> = new EventEmitter<string>();

  onInputSearch(searchString: string): void {
    this.inputSearch.emit(searchString);
  }

  onViewChanged(viewMode: DataViewModeType): void {
    this.viewChanged.emit(viewMode);
  }

  onColumnsChanged(columns: DataGridTableColumnInterface[]): void {
    this.columnsChanged.emit(columns);
  }

}
