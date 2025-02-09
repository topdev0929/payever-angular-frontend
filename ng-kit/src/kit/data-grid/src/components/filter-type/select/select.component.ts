import { Component, ChangeDetectionStrategy } from '@angular/core';
import { forEach } from 'lodash-es';

import { TranslateService } from '../../../../../i18n';

import { DataGridFilterTypeDefaultComponent } from '../default/default.component';
import { DataGridFilterSchemaInterface, DataGridFilterSelectOptionInterface } from '../../../interfaces';

@Component({
  selector: 'pe-data-grid-filter-type-select',
  templateUrl: 'select.component.html',
  styleUrls: ['../container/container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridFilterTypeSelectComponent extends DataGridFilterTypeDefaultComponent {

  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  get isSingle(): boolean {
    return this.filterSchema.options.length < 2;
  }

  get options(): DataGridFilterSelectOptionInterface[] {
    const activeFiltersValues: string[] = Array.isArray(this.activeFilters)
      ? this.activeFilters.map(activeFilter => activeFilter.value)
      : [];
    // excluding options selected before for multiselect
    const filtered: DataGridFilterSelectOptionInterface[] = this.filterSchema.options.filter((option: DataGridFilterSelectOptionInterface) => {
      return activeFiltersValues.indexOf(option.value) === -1;
    });
    forEach(filtered, option => {
      if (this.translateService.hasTranslation(option.label)) {
        option.label = this.translateService.translate(option.label);
      }
    });
    return filtered;
  }

}
