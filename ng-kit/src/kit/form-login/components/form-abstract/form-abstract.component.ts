import { Injector, Directive } from '@angular/core';

import { BaseFormAbstractComponent } from '../../../form-core/components/base-form-abstract';
import { FormSchemeField } from '../../interfaces';

@Directive()
export abstract class FormAbstractComponent<T extends {}> extends BaseFormAbstractComponent<T, FormSchemeField> {

  constructor(injector: Injector) {
    super(injector);
  }
}
