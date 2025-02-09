import { NgModule } from '@angular/core';

import { DividerDocComponent } from './divider-doc.component';
import { DividerDefaultExampleComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DividerModule } from '../../../../kit/divider';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DividerModule
  ],
  declarations: [
    DividerDocComponent,
    DividerDefaultExampleComponent
  ]
})
export class DividerDocModule {
}
