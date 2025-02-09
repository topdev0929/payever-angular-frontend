import { EventEmitter, Injector, Input, Output, Directive } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash-es';

import { BaseFormComponent } from '../base-form.component';

import { SettingsOptionsInterface } from '../base-main.component';

@Directive()
export abstract class BaseSettingsComponent<T> extends BaseFormComponent<T> {

  @Input() integrationName: string;
  @Output() changed: EventEmitter<SettingsOptionsInterface> = new EventEmitter();

  startValue: T = {} as any;
  hideDisabled: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }

  get formStorageKey(): string {
    return 'communications-settings-' + this.integrationName; // Doesn't matter here
  }

  afterCreateFormDeferred() {
    // For now we save even unchanged data (requested by BE devs)
    // this.startValue = cloneDeep(this.form.value);
  }

  protected onUpdateFormData(formValues: any): void {
    if (this.startValue && formValues && !isEqual(this.startValue, formValues)) {
      this.startValue = cloneDeep(this.form.value);
      this.changed.emit(this.form.value);
    }
  }

  onSuccess(): void {
    return;
  }
}
