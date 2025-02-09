import { HostBinding, Input, Directive } from '@angular/core';
import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';

@Directive()
export abstract class AbstractInputComponent extends AbstractFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;
  @Input() nameAttribute: string;
  @Input() autocompleteAttribute: string;
}
