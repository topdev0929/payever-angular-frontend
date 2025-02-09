import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';

import { PebEditorTabComponent } from './tab.component';
import { PebEditorTabsComponent } from './tabs.component';

@NgModule({
  imports: [
    CommonModule,
    PebAutoHideScrollbarModule,
  ],
  declarations: [
    PebEditorTabComponent,
    PebEditorTabsComponent,
  ],
  exports: [
    PebEditorTabComponent,
    PebEditorTabsComponent,
  ],
})
export class PebSidebarTabsModule {
}
