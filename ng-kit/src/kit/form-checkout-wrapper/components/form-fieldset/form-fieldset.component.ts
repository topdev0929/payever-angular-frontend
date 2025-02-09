import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LocaleDateAdapter } from '../../../form-core/date-adapters';
import { DateAdapter } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { TransformDateService } from '../../../form-core/services';
import { BaseFormFieldsetComponent } from '../../../form-core/components/base-form-fieldset';
import { FormSchemeField, FormFieldType } from '../../interfaces';

@Component({
  // Unfortunately material forms does not work well with OnPush strategy
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'pe-form-checkout-wrapper-fieldset',
  templateUrl: 'form-fieldset.component.html',
  styleUrls: ['./form-fieldset.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: LocaleDateAdapter,
      deps: [Platform, TransformDateService],
    }
  ]
})
export class FormLoginFieldsetComponent extends BaseFormFieldsetComponent<FormSchemeField> {
  readonly FormFieldType: typeof FormFieldType = FormFieldType;
}
