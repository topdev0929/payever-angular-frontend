import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';

import { PebEditorAnimationSidebarModule } from '../animation';
import { PebGenericSidebarModule } from '../generic-sidebar';
import { PebEditorGridPluginModule } from '../grid';
import { PebEditorPageSidebarModule } from '../page';
import { PebEditorPageFormatPluginModule } from '../page-format';
import { PebEditorSectionPluginModule } from '../section';
import { PebEditorShapePluginModule } from '../shape';
import { PebEditorTextPluginModule } from '../text';
import { PebEditorVectorPluginModule } from '../vector';

import { PebEditorRightSidebarComponent } from './right-sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    PebAutoHideScrollbarModule,
    PebEditorAnimationSidebarModule,
    PebEditorPageSidebarModule,
    PebGenericSidebarModule,
    PebEditorShapePluginModule,
    PebEditorSectionPluginModule,
    PebEditorGridPluginModule,
    PebEditorPageFormatPluginModule,
    PebEditorTextPluginModule,
    PebEditorVectorPluginModule,
  ],
  declarations: [PebEditorRightSidebarComponent],
  exports: [PebEditorRightSidebarComponent],
})
export class PebRightSidebarModule {}
