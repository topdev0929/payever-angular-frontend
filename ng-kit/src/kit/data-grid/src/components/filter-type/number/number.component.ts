import { Component, ChangeDetectionStrategy } from '@angular/core';

import { TranslateService } from '../../../../../i18n';

import { DataGridFilterTypeDefaultComponent } from '../default/default.component';
import { DataGridFilterCondition } from '../../../interfaces';

@Component({
  selector: 'pe-data-grid-filter-type-number',
  templateUrl: 'number.component.html',
  styleUrls: ['../container/container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridFilterTypeNumberComponent extends DataGridFilterTypeDefaultComponent {
  rangeCondition: string;

  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.rangeCondition = DataGridFilterCondition.Between;
  }

  onChangeCondition(): void {
    if ( this.filter.condition === this.rangeCondition ) {
      this.filter.value = {
        from: '',
        to: ''
      };
    }
    else if (typeof this.filter.value !== 'string') {
      this.filter.value = '';
    }
  }
}
