import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';

import { TranslateService } from '../../../../../i18n';

import { DataGridFilterSchemaInterface, DataGridFilterInterface, DataGridFilterCondition, DataGridFilterType } from '../../../interfaces';
import { DataGridDefaultFilterConditions } from '../../../const';

@Component({
  selector: 'pe-data-grid-filter-type-default',
  templateUrl: 'default.component.html',
  styleUrls: ['../container/container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridFilterTypeDefaultComponent implements OnInit {
  conditions: {
    value: string;
    label: string;
  }[] = [];

  @Input() activeFilters: DataGridFilterInterface[];
  @Input() filter: DataGridFilterInterface;
  @Input() filterSchema: DataGridFilterSchemaInterface;
  @Output() submitForm: EventEmitter<null> = new EventEmitter();

  constructor(protected translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.initConditions();
  }

  onSubmitForm(): void {
    this.submitForm.emit();
  }

  get schemaConditions(): DataGridFilterCondition[] {
    switch (this.filterSchema.type) {
      case DataGridFilterType.Text:
      case DataGridFilterType.Email:
        return DataGridDefaultFilterConditions.text;
      case DataGridFilterType.Number:
        return DataGridDefaultFilterConditions.number;
      case DataGridFilterType.Date:
        return DataGridDefaultFilterConditions.date;
      case DataGridFilterType.Select:
        return DataGridDefaultFilterConditions.select;
    }
  }

  protected initConditions(): void {
    this.schemaConditions.forEach((option: string) => {
      this.conditions.push({
        value: option,
        label: this.translateService.translate(`ng_kit.data_grid.filter.condition.${option}`)
      });
    });
  }
}
