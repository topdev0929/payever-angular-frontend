import {
  Component,
  Input,
  ViewEncapsulation,
  Injector,
  HostBinding
} from '@angular/core';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';

@Component({
  selector: 'pe-phone-input',
  templateUrl: './phone-input.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PhoneInputComponent extends AbstractFieldComponent {

  @Input() placeholder: string;

  @HostBinding('class.pe-input') hostClass: boolean = true;

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

}
