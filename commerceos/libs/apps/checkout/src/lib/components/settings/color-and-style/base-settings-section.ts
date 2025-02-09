import { Directive, Injector, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


import { FormSchemeInterface } from './interfaces';

@Directive()
export abstract class BaseSettingsSectionComponent {
  @Input() parentForm: FormGroup;

  abstract formScheme: FormSchemeInterface;

  constructor(
    protected injector: Injector
  ) {
  }
}
