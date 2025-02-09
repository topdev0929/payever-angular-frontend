import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebAnimationModule } from '@pe/builder/animations';
import { PebDirectivesModule } from '@pe/builder/directives';
import { PebPipesModule } from '@pe/builder/pipes';
import { PebFillModule, PebVectorElementModule } from '@pe/builder/renderer-fill';
import { I18nModule } from '@pe/i18n';

import { PebElementLayoutComponent } from './element-layout.component';
import { PebElementComponent } from './element.component';
import { PebRendererComponent } from './renderer.component';
import { PebTextEditorModule } from './text-editor';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    PebPipesModule,
    PebTextEditorModule,
    PebDirectivesModule,
    PebFillModule,
    PebVectorElementModule,
    PebAnimationModule,
  ],
  declarations: [
    PebElementComponent,
    PebElementLayoutComponent,
    PebRendererComponent,
  ],
  exports: [
    PebRendererComponent,
    PebElementComponent,
  ],
})
export class PebRendererModule {
}
