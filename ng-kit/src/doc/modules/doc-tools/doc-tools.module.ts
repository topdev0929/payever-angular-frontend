import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentApiRendererComponent } from './components';
import { ServiceApiRendererComponent } from './components';
import { JsDocService } from './services/jsdoc.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ComponentApiRendererComponent,
    ServiceApiRendererComponent
  ],
  providers: [
    JsDocService
  ],
  exports: [
    ComponentApiRendererComponent,
    ServiceApiRendererComponent
  ]
})
export class DocToolsModule {}
