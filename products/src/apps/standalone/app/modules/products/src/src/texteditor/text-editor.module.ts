import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormModule } from '@pe/forms';

import { CommandExecutorService } from './services/command-executor.service';
import { TextEditorService } from './services/text-editor.service';
import { TextEditorComponent } from './text-editor.component';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
  ],
  declarations: [
    TextEditorComponent,
  ],
  entryComponents: [
    TextEditorComponent,
  ],
  exports: [
    TextEditorComponent,
  ],
  providers: [
    TextEditorService,
    CommandExecutorService,
  ],
})
export class TextEditorModule {}
