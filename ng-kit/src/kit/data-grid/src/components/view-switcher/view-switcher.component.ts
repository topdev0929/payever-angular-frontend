import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DataViewModeType } from '../../interfaces';

@Component({
  selector: 'pe-data-grid-view-switcher',
  templateUrl: 'view-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridViewSwitcherComponent {

  dataViewMode: typeof DataViewModeType = DataViewModeType;

  @Input() viewMode: DataViewModeType = this.dataViewMode.List;

  @Output() viewChanged: EventEmitter<DataViewModeType> = new EventEmitter<DataViewModeType>();

  setViewMode(viewMode: DataViewModeType): void {
    this.viewMode = viewMode;
    this.viewChanged.emit(this.viewMode);
  }

}
