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

import { PebShopEditorComponent } from './shop-editor.component';
import { ShopThemeGuard } from '../../guards/theme.guard';
import { PebShopBuilderViewComponent } from '../../components';
import { pebShopElementsConfig } from '../../shop.config';
import { PebShopBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import { PeShopBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebShopEditorComponent,
    canActivate: [ShopThemeGuard],
  },
]);

export const pebViewerModuleForChild = PebViewerModule.withConfig(pebShopElementsConfig);

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
    PebShopEditorComponent,
    PebShopBuilderViewComponent,
    PebShopBuilderInsertComponent,
    PeShopBuilderEditComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebShopBuilderInsertComponent,
    PeShopBuilderEditComponent,
  ],
  providers: [
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ],
})
export class PebShopEditorRouteModule {}
