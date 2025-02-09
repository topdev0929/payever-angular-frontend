import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PebEditorPageSidebarFormatComponent } from './page-format.sidebar';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
  ],
  declarations: [
    PebEditorPageSidebarFormatComponent,
  ],
  exports: [
    PebEditorPageSidebarFormatComponent,
  ],
})
export class PebEditorPageFormatPluginModule {
}
