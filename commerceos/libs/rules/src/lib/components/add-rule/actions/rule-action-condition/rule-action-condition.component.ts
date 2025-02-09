import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeFilterType } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n-core';
import { PeDateTimePickerService } from '@pe/ui';

import {
  ConditionActionDataType,
  RuleConditions,
  RuleFields,
} from '../../../../models/rules.model';
import { AbstractActionForm } from '../abstract-action-form.component';

@Component({
  selector: 'pe-rule-action-condition',
  templateUrl: './rule-action-condition.component.html',
  styleUrls: ['./rule-action-condition.component.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class RuleActionConditionComponent extends AbstractActionForm implements OnInit, AfterViewInit  {
  @Input() defaultData: ConditionActionDataType;

  ifList: RuleFields[] = [];
  allConditions: RuleConditions[] = [];

  readonly PeFilterType = PeFilterType;

  typeField = '';

  get valuesField(): AbstractControl {
    return this.formGroup.get('values');
  }

  private destroy$: PeDestroyService = this.injector.get(PeDestroyService);
  private dateTimePicker: PeDateTimePickerService = this.injector.get(PeDateTimePickerService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  ngOnInit(): void {
    this.ifList = this.overlayData.fields;
    this.allConditions = this.overlayData.conditions;

    this.formGroup.addControl('field', new FormControl(this.defaultData?.field, [Validators.required]));
    this.formGroup.addControl('values', new FormControl(this.defaultData?.values, [Validators.required]));
    this.formGroup.addControl('condition', new FormControl(this.defaultData?.condition, [Validators.required]));
  }

  get conditionList(): RuleConditions[] {
    const field = this.ifList.find(a => a.fieldName === this.formGroup.get('field').value);

    return field?.conditions.map(b => this.allConditions.find(c => c.value === b));
  }

  get fieldIsSelected(): boolean {
    return !!this.formGroup.get('field').value;
  }

  get field(): RuleFields {
    return this.ifList.find(a => a.fieldName === this.formGroup.get('field')?.value);
  }

  get fieldType(): PeFilterType {
    return this.field?.type;
  }

  get typeOptionsList(): RuleConditions[] {
    return this.field?.options;
  }

  get isFormFieldInput(): boolean {
    return this.fieldType === PeFilterType.String ||
      this.fieldType === PeFilterType.Number ||
      this.fieldType === PeFilterType.Date;
  }

  get isFormFieldSelect(): boolean {
    return this.fieldType === PeFilterType.Option;
  }

  ngAfterViewInit(): void {
    this.formGroup.get('field').valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.formGroup.get('condition').setValue(null);
      this.formGroup.get('values').setValue([]);
    });
  }

  onAddValue(): void {
    if (!this.typeField) { return; }
    this.addChip();
    this.typeField = '';
    this.cdr.detectChanges();
  }

  onChipDelete(i: number): void {
    const types: string[] = this.valuesField.value;
    types.splice(i, 1);
    this.valuesField.setValue(types);
    this.cdr.detectChanges();
  }

  openDatepicker(event): void {
    const dialogRef = this.dateTimePicker.open(event, {
      config: { headerTitle: 'Select date', range: false },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      tap((date) => {
        if (date?.start) {
          const formatedDate = date.start;
          this.typeField = formatedDate;
          this.onAddValue();
        }
      })
    ).subscribe();
  }

  formatValue(value: string): string {
    if (this.fieldType === PeFilterType.Date) {
      return moment(value).format('DD.MM.YYYY');
    }
    if (this.fieldType === PeFilterType.Option) {
      return this.translateService.translate(this.typeOptionsList.find(a => a.value === value)?.label);
    }

    return value;
  }

  private addChip(): void {
    let value = this.typeField.trim();

    if (this.fieldType === PeFilterType.Date) {
      value = this.fixDate(value);
    }

    const values = [...new Set([...this.valuesField.value, value])];

    this.valuesField.setValue(values);
  }

  private fixDate(date: string): string {
    const iso = moment.parseZone(date).toISOString(true);

    return iso.split('T')[0] + 'T00:00:00.00+00:00';
  }
}
