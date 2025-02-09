import { NgModule } from '@angular/core';
import { ToolbarDocComponent } from './toolbar-doc.component';
import { ToolbarDefaultExampleComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ToolbarModule } from '../../../../kit/toolbar/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ToolbarModule
  ],
  declarations: [
    ToolbarDocComponent,
    ToolbarDefaultExampleComponent
  ]
})
export class ToolbarDocModule {
}
