import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateService } from '../../../../i18n';
import {
  DataGridFilterInterface,
  DataGridFilterSchemaInterface,
  DataGridFilterSelectOptionInterface
} from '../../interfaces';

@Component({
  selector: 'pe-data-grid-filters',
  templateUrl: 'filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridFiltersComponent {

  @Input() set filtersSchema(data: DataGridFilterSchemaInterface[]) {
    this.filterSchema$.next(data || []);
  }

  @Input()
  set filters(items: DataGridFilterInterface[]) {
    this.filters$.next(items || []);
  }

  @Output() filterRemoved: EventEmitter<DataGridFilterInterface> = new EventEmitter<DataGridFilterInterface>();

  private filterSchema$: BehaviorSubject<DataGridFilterSchemaInterface[]> = new BehaviorSubject<DataGridFilterSchemaInterface[]>([]);
  private filters$: BehaviorSubject<DataGridFilterInterface[]> = new BehaviorSubject<DataGridFilterInterface[]>([]);

  constructor(
    private translateService: TranslateService
  ) {}

  get visibleFilters$(): Observable<DataGridFilterInterface[]> {
    return combineLatest(this.filterSchema$, this.filters$).pipe(map(([schemas, filters]) => {
      return filters.filter((filter: DataGridFilterInterface) => schemas.find(schema => schema.field === filter.key));
    }));
  }

  remove(filter: DataGridFilterInterface): void {
    this.filterRemoved.emit(filter);
  }

  getFilterSchema(filter: DataGridFilterInterface): DataGridFilterSchemaInterface {
    return this.filterSchema$.value.find(filterSchema => filterSchema.field === filter.key);
  }

  getFilterValueSelectLabel(filter: DataGridFilterInterface): string {
    const schema: DataGridFilterSchemaInterface = this.getFilterSchema(filter);
    const option: DataGridFilterSelectOptionInterface = schema.options.find((option: DataGridFilterSelectOptionInterface) => option.value === filter.value);
    const result = option ? option.label : filter.value;
    return this.translateService.hasTranslation(result) ? this.translateService.translate(result) : result;
  }

}
