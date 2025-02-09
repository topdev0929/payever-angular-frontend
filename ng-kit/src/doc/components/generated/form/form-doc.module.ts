import { NgModule } from '@angular/core';

import { CounterModule } from '../../../../kit/counter';
import { FeedbackModule } from '../../../../kit/feedback';
import { FormModule } from '../../../../kit/form';
import { FormComponentsInputModule } from '../../../../kit/form-components/input';
import { FormComponentsCheckboxModule } from '../../../../kit/form-components/checkbox';
import { FormComponentsTextareaModule } from '../../../../kit/form-components/textarea';
import { FormLoginModule } from '../../../../kit/form-login';
import { I18nModule } from '../../../../kit/i18n';
import { PriceModule } from '../../../../kit/price';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { MediaModule } from '../../../../kit/media';

import { CheckboxDocComponent, CheckboxDocDefaultExampleComponent } from './checkbox';
import { FormAbstractDocComponent } from './form-abstract-doc.component';
import { FormAddonDocComponent } from './form-addon-doc.component';
import { FormDocComponent } from './form-doc.component';
import {
  FormFieldsetDocComponent,
  FormFieldsetDefaultExampleComponent,
  FormFieldsetHideDisabledExampleComponent,
  FormFieldsetLoginExampleComponent,
  FormFieldsetNoBorderExampleComponent,
  FormFieldsetStoreExampleComponent
} from './form-fieldset';
import { FormFieldsetDocComponentOld } from './form-fieldset-doc.component';
import { InputDocComponent, InputDocExampleBasicComponent } from './input';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormModule,
    FormComponentsInputModule,
    FormComponentsCheckboxModule,
    FormComponentsTextareaModule,
    FormLoginModule,
    MediaModule,
    PriceModule,
    CounterModule,
    FeedbackModule,
    I18nModule.forRoot({ useStorageForLocale: true })
  ],
  declarations: [
    FormAbstractDocComponent,
    FormAddonDocComponent,
    FormDocComponent,
    FormFieldsetDocComponent,
    FormFieldsetDefaultExampleComponent,
    FormFieldsetHideDisabledExampleComponent,
    FormFieldsetLoginExampleComponent,
    FormFieldsetNoBorderExampleComponent,
    FormFieldsetStoreExampleComponent,
    FormFieldsetDocComponentOld,

    CheckboxDocComponent,
    CheckboxDocDefaultExampleComponent,
    InputDocComponent,
    InputDocExampleBasicComponent
  ]
})
export class FormDocModule {

}
