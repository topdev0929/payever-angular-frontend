import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule } from '../../form';
import { I18nModule } from '../../i18n';
import { TextEditorComponent } from './text-editor.component';
import { TextEditorService } from './services/text-editor.service';
import { CommandExecutorService } from './services/command-executor.service';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    I18nModule.forChild()
  ],
  declarations: [
    TextEditorComponent
  ],
  entryComponents: [
    TextEditorComponent
  ],
  exports: [
    TextEditorComponent
  ],
  providers: [
    TextEditorService,
    CommandExecutorService
  ]
})
export class TextEditorModule {}
