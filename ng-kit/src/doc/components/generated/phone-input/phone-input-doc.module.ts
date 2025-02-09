import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormModule } from '../../../../kit/form';
import { PhoneInputDocComponent } from './phone-input-doc.component';
import {
  PhoneInputDocExampleNoValidation,
  PhoneInputDocExampleDefaultValidation,
  PhoneInputDocExampleCountryCodeValidation,
} from './examples';

@NgModule({
  imports: [
    DocComponentSharedModule,
    MatButtonModule,
    FormModule
  ],
  declarations: [
    PhoneInputDocComponent,
    PhoneInputDocExampleNoValidation,
    PhoneInputDocExampleDefaultValidation,
    PhoneInputDocExampleCountryCodeValidation,
  ]
})
export class PhoneInputDocModule {
}
