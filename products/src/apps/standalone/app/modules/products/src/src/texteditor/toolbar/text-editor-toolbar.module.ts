import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { FormModule } from '@pe/forms';

import { TextEditorToolbarComponent } from './text-editor-toolbar.component';
import { TextEditorService } from '../services/text-editor.service';
import { CommandExecutorService } from '../services/command-executor.service';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    MatButtonModule,
    MatMenuModule,
  ],
  declarations: [
    TextEditorToolbarComponent,
  ],
  entryComponents: [
    TextEditorToolbarComponent,
  ],
  exports: [
    TextEditorToolbarComponent,
  ],
  providers: [
    TextEditorService,
    CommandExecutorService,
  ],
})
export class TextEditorToolbarModule {}
