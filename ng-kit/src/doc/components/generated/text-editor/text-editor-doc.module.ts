import { NgModule } from '@angular/core';
import { TextEditorDocComponent } from './text-editor-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { TextEditorModule, TextEditorService, TextEditorToolbarModule } from '../../../../kit/text-editor';
import { FormModule } from '../../../../kit/form';

@NgModule({
  imports: [
    DocComponentSharedModule,
    TextEditorModule,
    TextEditorToolbarModule
  ],
  declarations: [TextEditorDocComponent],
  providers: [TextEditorService]
})
export class TextEditorDocModule {
}
