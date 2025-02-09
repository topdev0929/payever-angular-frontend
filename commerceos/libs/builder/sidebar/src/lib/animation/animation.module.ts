import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import {
  PebAnimationFormModule,
  PebInteractionsFormModule,
  PebRestrictAccessFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebEditorAnimationSidebarComponent } from './animation.sidebar';

@NgModule({
  imports: [
    CommonModule,
    PebRestrictAccessFormModule,
    PebAnimationFormModule,
    PebSidebarTabsModule,
    PebAutoHideScrollbarModule,
    I18nModule,
    PebInteractionsFormModule,
  ],
  declarations: [
    PebEditorAnimationSidebarComponent,
  ],
  exports: [
    PebEditorAnimationSidebarComponent,
  ],
})
export class PebEditorAnimationSidebarModule {
}
