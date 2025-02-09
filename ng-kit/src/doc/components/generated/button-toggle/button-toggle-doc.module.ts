import { NgModule } from '@angular/core';

import { FormComponentsButtonToggleModule } from '../../../../kit/form-components/button-toggle';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ButtonToggleDocComponent } from './button-toggle-doc.component';
import { ButtonToggleDefaultExampleDocComponent, ButtonToggleIconExampleDocComponent } from './examples';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsButtonToggleModule
  ],
  declarations: [
    ButtonToggleDocComponent,
    ButtonToggleDefaultExampleDocComponent,
    ButtonToggleIconExampleDocComponent
  ]
})
export class ButtonToggleDocModule {
}
