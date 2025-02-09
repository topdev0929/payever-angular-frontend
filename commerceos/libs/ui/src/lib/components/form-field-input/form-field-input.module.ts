import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';

import { PebCheckboxModule } from '../checkbox/checkbox.module';

import { DateValueAccessorDirective } from './date-value-accessor.directive';
import { PebFormFieldInputComponent } from './form-field-input';
import { PeFormFieldInputDirective } from './form-field-input.directive';
import { PebInputDirective } from './input';
import { PeInputTimeDirective } from './input-time.directive';
import { PePasswordInputDirective } from './password-input';
import { PeTooltipModalComponent } from './password-tooltip/password-tootip-modal';

@NgModule({
  imports: [CommonModule, PebCheckboxModule, I18nModule],
  declarations: [
    PeFormFieldInputDirective,
    PebFormFieldInputComponent,
    PebInputDirective,
    PePasswordInputDirective,
    PeInputTimeDirective,
    PeTooltipModalComponent,
    DateValueAccessorDirective,
  ],
  exports: [
    PeFormFieldInputDirective,
    PebFormFieldInputComponent,
    PebInputDirective,
    PePasswordInputDirective,
    DateValueAccessorDirective,
    PeInputTimeDirective,
  ],
})
export class PebFormFieldInputModule { }
