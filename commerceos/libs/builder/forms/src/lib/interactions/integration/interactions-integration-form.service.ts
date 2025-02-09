import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebIntegrationAction, PebIntegrationInteractionBase, PebInteraction } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';

import { FormModel } from '../model';

import { integrationInitValue } from '.';

@Injectable()
export class PebInteractionIntegrationFormService {
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
  ) {
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      ...integrationInitValue,
    });
  }

  toIntegrationForm(interaction: PebInteraction): PebIntegrationAction {
    const init = integrationInitValue;
    const form = interaction as PebIntegrationInteractionBase;
    
    return {
       ...form.integrationAction ?? init.integrationAction,
    };
  }

  toInteraction(form: FormModel): PebIntegrationInteractionBase {
    return {
      type: form.action,
      trigger: form.trigger,
      integrationAction: form.integrationAction,
    };
  }
}
