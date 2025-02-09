import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  registerColor,
  registerFontFamily,
  registerFontSize,
  registerFontWeight,
  registerGradient,
  registerPebLink,
} from './quill';
import { PebTextEditorComponent } from './text-editor.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PebTextEditorComponent,
  ],
  exports: [
    PebTextEditorComponent,
  ],
})
export class PebTextEditorModule {
  constructor() {
    registerFontSize();
    registerFontFamily();
    registerFontWeight();
    registerPebLink();
    registerColor();
    registerGradient();
  }
}
