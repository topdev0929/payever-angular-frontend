import { NgModule } from '@angular/core';
import { RadioDocComponent } from './radio-doc.component';
import { RadioDefaultExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormComponentsRadioModule } from '../../../../kit/form-components/radio';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsRadioModule
  ],
  declarations: [
    RadioDocComponent,
    RadioDefaultExampleDocComponent
  ]
})
export class RadioDocModule {
}
