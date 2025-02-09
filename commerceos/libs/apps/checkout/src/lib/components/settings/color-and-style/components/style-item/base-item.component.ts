import { Directive, Injector, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive()
export abstract class BaseStyleItemComponent {
  @Input() control: AbstractControl;
  @Input() buttonLabelTranslateKey: string;
  @Input() labelTranslateKey: string;

  constructor(
    protected injector: Injector
  ) {}
}
