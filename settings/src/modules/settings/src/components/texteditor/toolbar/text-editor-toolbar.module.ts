import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormModule } from '@pe/forms';
import { CommandExecutorService } from '../services/command-executor.service';
import { TextEditorService } from '../services/text-editor.service';
import { TextEditorToolbarComponent } from './text-editor-toolbar.component';

@NgModule({
  imports: [
    FormModule,
    CommonModule,
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
