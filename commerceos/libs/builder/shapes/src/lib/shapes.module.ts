import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PebRendererModule } from '@pe/builder/renderer';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { PebCreateShapeModule } from './create-shape/create-shape.module';
import { PebDialog } from './dialog.component';
import { PebShapesContextMenuComponent } from './shapes-context-menu/shapes-context-menu.component';
import { PebShapesComponent } from './shapes.component';


@NgModule({
  imports: [
    CommonModule,
    PebRendererModule,
    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    ReactiveFormsModule,
    PeGridModule,
    PeFoldersModule,
    NgxsModule.forFeature([PeGridState]),
    RouterModule.forChild([{ path: '', component: PebDialog }]),
    PebCreateShapeModule,
    I18nModule,
  ],
  providers: [
    PeFoldersActionsService,
    PeFoldersApiService,
  ],
  declarations: [
    PebShapesComponent,
    PebShapesContextMenuComponent,
    PebDialog,
  ],
})
export class PebShapesModule {
}
