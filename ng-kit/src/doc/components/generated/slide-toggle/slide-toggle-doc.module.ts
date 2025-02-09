import { NgModule } from '@angular/core';
import { SlideToggleDocComponent } from './slide-toggle-doc.component';
import { SlideToggleDefaultExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormComponentsSlideToggleModule } from '../../../../kit/form-components/slide-toggle';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsSlideToggleModule
  ],
  declarations: [
    SlideToggleDocComponent,
    SlideToggleDefaultExampleDocComponent
  ]
})
export class SlideToggleDocModule {
}
