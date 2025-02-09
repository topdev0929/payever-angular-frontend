import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebPageFormModule, PebRestrictAccessFormModule } from '@pe/builder/forms';

import { PebEditorPageSidebarComponent } from './page.sidebar';

@NgModule({
  imports: [
    CommonModule,
    PebRestrictAccessFormModule,
    PebPageFormModule,
    PebAutoHideScrollbarModule,
  ],
  declarations: [
    PebEditorPageSidebarComponent,
  ],
  exports: [
    PebEditorPageSidebarComponent,
  ],
})
export class PebEditorPageSidebarModule {
}
