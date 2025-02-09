import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import { FormComponentsCheckboxModule } from '../../../../kit/form-components/checkbox';
import { FormComponentsInputModule } from '../../../../kit/form-components/input';

import { CustomElementWrapperDocComponent } from './custom-element-wrapper-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { MicroModule } from '../../../../kit/micro';

@NgModule({
  imports: [
    MatButtonModule,
    DocComponentSharedModule,
    MicroModule,
    MicroModule.forRoot(),

    FormComponentsCheckboxModule,
    FormComponentsInputModule
  ],
  declarations: [CustomElementWrapperDocComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CustomElementWrapperDocModule {
}
