import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import { DataGridFilterInterface, DataGridFilterType, DataGridFilterSchemaInterface } from '../../interfaces';
import { DataGridDefaultFilterFactory } from '../../const';

@Component({
  selector: 'pe-data-grid-filters-menu',
  templateUrl: 'filters-menu.component.html',
  styleUrls: ['./filters-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridFiltersMenuComponent {

  filterToAdd: DataGridFilterInterface = null;

  @Input() filtersSchema: DataGridFilterSchemaInterface[];
  @Input() activeFilters: DataGridFilterInterface[];
  @Input() isShowAddText: boolean = true;
  @Input() title: string;

  @Output() filterAdded: EventEmitter<DataGridFilterInterface> = new EventEmitter<DataGridFilterInterface>();

  onAddFilter(event: Event, filterSchema: DataGridFilterSchemaInterface): void {
    event.stopPropagation();
    switch (filterSchema.type) {
      case (DataGridFilterType.Text):
      case (DataGridFilterType.Email):
        this.filterToAdd = DataGridDefaultFilterFactory.text(filterSchema.field);
        break;
      case (DataGridFilterType.Number):
        this.filterToAdd = DataGridDefaultFilterFactory.number(filterSchema.field);
        break;
      case (DataGridFilterType.Date):
        this.filterToAdd = DataGridDefaultFilterFactory.date(filterSchema.field);
        break;
      case (DataGridFilterType.Select):
        this.filterToAdd = DataGridDefaultFilterFactory.select(filterSchema.field);
        break;
      default:
        throw new Error(`Unknown field type: ${filterSchema.type}`);
    }
  }

  getFilterSchema(filterToAdd: DataGridFilterInterface): DataGridFilterSchemaInterface {
    return this.filtersSchema.find(filterSchema => filterSchema.field === filterToAdd.key);
  }

  getActiveFilters(filterToAdd: DataGridFilterInterface): DataGridFilterInterface[] {
    return Array.isArray(this.activeFilters)
      ? this.activeFilters.filter(filter => filter.key === filterToAdd.key)
      : null;
  }

  onClose(): void {
    setTimeout(() => {
      this.filterToAdd = null;
    }, 500);
  }

}
