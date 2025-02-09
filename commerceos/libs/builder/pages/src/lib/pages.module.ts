import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';
import { NgxsModule } from '@ngxs/store';

import { PebRendererModule } from '@pe/builder/renderer';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridModule, PeDataGridService } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PebFormFieldInputModule, PebSelectModule } from '@pe/ui';

import { PebPagesContextMenuComponent } from './pages-context-menu/pages-context-menu.component';
import { PebPagesFolderDialogComponent } from './pages-folder-dialog/pages-folder-dialog.component';
import { PebPagesComponent } from './pages.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatIconModule,
    MatTreeModule,
    MatSelectModule,

    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    PebRendererModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebConfirmActionDialogModule,
    PeGridModule,
    PeFoldersModule,
    NgxsModule.forFeature([PeGridState]),
    I18nModule,
  ],
  declarations: [
    PebPagesComponent,
    PebPagesContextMenuComponent,
    PebPagesFolderDialogComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebPagesComponent,
  ],
  providers: [
    PeDataGridService,
  ],
})
export class PebPagesModule {}
