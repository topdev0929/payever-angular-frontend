import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebDirectivesModule } from '@pe/builder/directives';
import { PebRendererModule } from '@pe/builder/renderer';

import { PebPagePreviewComponent } from './page-preview/page-preview.component';

@NgModule({
  imports: [
    CommonModule,
    PebRendererModule,
    PebDirectivesModule,
  ],
  declarations: [
    PebPagePreviewComponent,
  ],
  exports: [
    PebPagePreviewComponent,
  ],
})
export class PebPagePreviewModule {
}
