import { Component, Output, EventEmitter, Injector, Input } from '@angular/core';
import { AbstractInputComponent } from '../../../input';
import { InputChangeEvent } from '../../../../form-core/interfaces';

@Component({
  selector: 'pe-input-password',
  templateUrl: './input-password.component.html'
})
export class InputPasswordComponent extends AbstractInputComponent {

  @Input() showPasswordRequirements: boolean = true;
  @Input() showForgotPassword: boolean = false;
  @Output() forgotPasswordClick: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() valueChange: EventEmitter<InputChangeEvent> = new EventEmitter<InputChangeEvent>();

  constructor(protected injector: Injector) {
    super(injector);
  }

  get focused(): boolean {
    return this.isFocused;
  }
}
