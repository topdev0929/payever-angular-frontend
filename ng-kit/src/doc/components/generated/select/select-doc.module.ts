import { NgModule } from '@angular/core';
import { SelectDocComponent } from './select-doc.component';
import { SelectCountryExampleComponent, SelectDefaultExampleComponent, SelectGroupExampleComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormComponentsSelectModule } from '../../../../kit/form-components/select';
import { FormComponentsSelectCountryModule } from '../../../../kit/form-components/select-country';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsSelectModule,
    FormComponentsSelectCountryModule
  ],
  declarations: [
    SelectDocComponent,
    SelectDefaultExampleComponent,
    SelectGroupExampleComponent,
    SelectCountryExampleComponent
  ]
})
export class SelectDocModule {
}
