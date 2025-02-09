import { NgModule } from '@angular/core';
import { ParagraphEditorDocComponent } from './paragraph-editor-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ParagraphEditorModule } from '../../../../kit/paragraph-editor';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ParagraphEditorModule
  ],
  declarations: [ParagraphEditorDocComponent]
})
export class ParagraphEditorDocModule {
}
