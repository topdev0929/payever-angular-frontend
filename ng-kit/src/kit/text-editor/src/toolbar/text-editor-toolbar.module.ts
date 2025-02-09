import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule } from '../../../form';
import { I18nModule } from '../../../i18n';
import { TextEditorToolbarComponent } from './text-editor-toolbar.component';
import { TextEditorService } from '../services/text-editor.service';
import { CommandExecutorService } from '../services/command-executor.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    MatButtonModule,
    MatMenuModule,
    ColorPickerModule,
    I18nModule.forChild()
  ],
  declarations: [
    TextEditorToolbarComponent
  ],
  entryComponents: [
    TextEditorToolbarComponent
  ],
  exports: [
    TextEditorToolbarComponent
  ],
  providers: [
    TextEditorService,
    CommandExecutorService
  ]
})
export class TextEditorToolbarModule {}
