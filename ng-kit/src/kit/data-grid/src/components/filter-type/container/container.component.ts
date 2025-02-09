import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { DataGridFilterInterface, DataGridFilterSchemaInterface, DataGridValueRangeInterface } from '../../../interfaces';

@Component({
  selector: 'pe-data-grid-filter-type-container',
  templateUrl: 'container.component.html',
  styleUrls: ['./container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridFilterTypeContainerComponent implements OnInit {
  @Input() activeFilters: DataGridFilterInterface[];
  @Input() filter: DataGridFilterInterface;
  @Input() filterSchema: DataGridFilterSchemaInterface;
  @Output() filterAdded: EventEmitter<DataGridFilterInterface> = new EventEmitter<DataGridFilterInterface>();
  @ViewChild('filterForm') filterForm: ElementRef;
  @HostBinding('class.list-filters-item') listFiltersItemClass: boolean = true;

  constructor() {}

  ngOnInit(): void {
  }

  isDisabledApply(): boolean {
    let disabled: boolean = true;
    if (this.filter.condition) {
      if (typeof this.filter.value === 'string' || this.filter.value instanceof Date) {
        disabled = !this.filter.value;
      }
      else {
        const value: DataGridValueRangeInterface = this.filter.value as DataGridValueRangeInterface;
        if (+value.from <= +value.to) {
          disabled = false;
        }
        else if (value.dateFrom && value.dateTo) {
          disabled = false;
        }
      }
    }
    return disabled;
  }

  onSubmitForm(): void {
    this.filterAdded.emit(this.filter);
  }
}
