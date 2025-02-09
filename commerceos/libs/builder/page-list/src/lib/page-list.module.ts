import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';

import { PebDirectivesModule } from '@pe/builder/directives';
import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebPagePreviewModule } from '@pe/builder/preview-renderer';
import { PebTextEditorModule } from '@pe/builder/renderer';
import { PeDestroyService } from '@pe/common';
import { I18nModule } from '@pe/i18n';

import { PebMasterPageListComponent } from './master-page/master-page-list.component';
import { PebPageListComponent } from './page-list.component';
import { PebPageListService } from './page-list.service';

@NgModule({
  imports: [
    CommonModule,
    PebAutoHideScrollbarModule,
    MatIconModule,
    RouterModule,
    DragDropModule,
    PebDirectivesModule,
    PebTextEditorModule,
    PebPagePreviewModule,
    I18nModule,
    MatTreeModule,
  ],
  declarations: [
    PebPageListComponent,
    PebMasterPageListComponent,
  ],
  exports: [
    PebPageListComponent,
    PebMasterPageListComponent,
  ],
  providers: [
    PeDestroyService,
    PebPageListService,
  ],
})
export class PebPageListModule {
}
