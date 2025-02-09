import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

import { LocaleConstantsService, TranslateService } from '../../../../../i18n';

import { DataGridFilterTypeDefaultComponent } from '../default/default.component';
import { DataGridFilterCondition } from '../../../interfaces';

// @TODO - material date picker should be used
declare const $: any;

@Component({
  selector: 'pe-data-grid-filter-type-date',
  templateUrl: 'date.component.html',
  styleUrls: ['../container/container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridFilterTypeDate extends DataGridFilterTypeDefaultComponent {
  rangeCondition: DataGridFilterCondition;

  form: FormGroup = null;
  now = new Date();

  constructor(protected formBuilder: FormBuilder,
              protected translateService: TranslateService,
              protected localeConstantsService: LocaleConstantsService,
              protected cdr: ChangeDetectorRef
  ) {
    super(translateService);
  }

  private get dateFormatShort(): string {
    return this.localeConstantsService.getDateFormatShort();
  }

  private get lang(): string {
    return this.localeConstantsService.getLang();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.rangeCondition = DataGridFilterCondition.BetweenDates;

    this.form = this.formBuilder.group({
      dateInput: [''],
      dateFromInput: [''],
      dateToInput: ['']
    });
  }

  setDateValue(value: string): string {
    let date: any;
    const inputFormat: string = this.dateFormatShort.toUpperCase();
    if (value) {
      date = moment(value, inputFormat);
    } else {
      date = moment();
    }
    return date.toDate();
  }

  valueChangeFromDate(date: {value: Date}): void {
    this.filter.value.dateFrom = date.value;
    this.cdr.markForCheck();
  }

  valueChangeToDate(date: {value: Date}): void {
    this.filter.value.dateTo = date.value;
    this.cdr.markForCheck();
  }

  valueChangeDate(date: {value: Date}): void {
    this.filter.value = date.value;
    this.cdr.markForCheck();
  }

  onChangeCondition(): void {
    if (this.filter.condition === this.rangeCondition) {
      this.filter.value = {
        dateFrom: null,
        dateTo: null
      };
    }
  }
}
