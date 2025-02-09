import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';

import { EditorContextMenuComponent } from './context-menu';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
  ],
  declarations: [
    EditorContextMenuComponent,
  ],
  exports: [
    EditorContextMenuComponent,
  ],
})
export class PebEditorSharedModule {
}
