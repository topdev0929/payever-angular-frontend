import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebCheckboxModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PeMenuModule,
} from '@pe/ui';

import { StatisticsHeaderService } from './infrastructure';
import { PeStatisticsMaterialComponent } from './material/material.component';
import { PeHeaderMenuModule } from './misc/components/header-menu/header-menu.module';
import { PeStatisticsComponent } from './routes/_root/statistics-root.component';
import { PeStatisticsGridComponent } from './routes/grid/statistics-grid.component';
import { PeStatisticsRouteModule } from './statistics.routing';
import { PeStatisticsSharedModule } from './statistics.shared';
import { WidgetsWrapperModule } from './widgets/widgets.module';

export const i18nModuleForRoot: ModuleWithProviders<I18nModule> = I18nModule.forRoot();

@NgModule({
  imports: [
    CommonModule,
    WidgetsWrapperModule,
    PeStatisticsRouteModule,
    PeStatisticsSharedModule,
    PeSidebarModule,
    PeFiltersModule,
    NgScrollbarModule,
    PePlatformHeaderModule,
    OverlayWidgetModule,
    MatGridListModule,
    MatSnackBarModule,

    PebButtonModule,
    PebCheckboxModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PeMenuModule,
    PeHeaderMenuModule,
    PeFoldersModule,

    i18nModuleForRoot,
    PeGridModule,
  ],
  declarations: [
    PeStatisticsComponent,
    PeStatisticsGridComponent,
    PeStatisticsMaterialComponent,
  ],
  providers: [
    StatisticsHeaderService,
    PeOverlayWidgetService,
    { 
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
      useValue: { duration: 2500 }, 
    },
  ],
})
export class PeStatisticsModule {}
