import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PeDataGridModule } from '@pe/data-grid';
import { PeSidebarModule } from '@pe/sidebar';
import { PeFiltersModule } from '@pe/filters';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { PebViewerModule } from '@pe/builder-viewer';

import { PebSubscriptionEditorComponent } from './subscription-editor.component';
import { SubscriptionThemeGuard } from '../../guards/theme.guard';
import {
  PebSubscriptionBuilderInsertComponent,
  PebSubscriptionBuilderViewComponent,
  PeSubscriptionBuilderEditComponent,
  PeSubscriptionBuilderPublishComponent,
} from '../../components';
import { pebSubscriptionElementsConfig } from '../../subscription.config';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebSubscriptionEditorComponent,
    canActivate: [SubscriptionThemeGuard],
  },
]);

export const pebViewerModuleForChild = PebViewerModule.withConfig(pebSubscriptionElementsConfig);

@NgModule({
  imports: [
    CommonModule,
    PebShopEditorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    routerModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    pebViewerModuleForChild,
  ],
  declarations: [
    PebSubscriptionBuilderInsertComponent,
    PebSubscriptionBuilderViewComponent,
    PeSubscriptionBuilderPublishComponent,
    PeSubscriptionBuilderEditComponent,
    PebSubscriptionEditorComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebSubscriptionBuilderInsertComponent,
    PeSubscriptionBuilderEditComponent,
  ],
  providers: [
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ],
})
export class PebSubscriptionEditorRouteModule {}
