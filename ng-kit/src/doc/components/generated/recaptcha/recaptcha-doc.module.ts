import { NgModule } from '@angular/core';

import { ReCaptchaDocComponent } from './recaptcha-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ReCaptchaModule } from '../../../../kit/recaptcha';
import { FormComponentsCheckboxModule } from '../../../../kit/form-components/checkbox';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsCheckboxModule,
    ReCaptchaModule
  ],
  declarations: [ReCaptchaDocComponent]
})
export class ReCaptchaDocModule {
}
