import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { YesNoOptions } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';

import { ExposedPersonFormValue } from '../../../../shared';

@Component({
  selector: 'exposed-person-form',
  templateUrl: './exposed-person-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExposedPersonFormComponent extends CompositeForm<ExposedPersonFormValue> {

  public readonly formGroup = this.fb.group({
    politicalExposedPerson: [null, Validators.required],
  });

  public readonly booleanOptions = YesNoOptions;
}
