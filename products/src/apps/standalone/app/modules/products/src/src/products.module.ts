import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthModule } from '@pe/auth';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeSidebarModule } from '@pe/sidebar';
import { SnackBarModule } from '@pe/forms';

import { ApolloConfigModule } from './app.apollo.module';
import { ProductsComponent } from './products.component';
import { ProductsApiService } from './shared/services/api.service';
import { DialogService } from './products-list/services/dialog-data.service';
import { ProductsRouterModule } from './products-routing.module';
import { ChannelTypeIconService } from './products-list/services/channel-type-icon.service';
import { EnvService } from './shared/services/env.service';
import { ImagesUploaderService } from './shared/services/images-uploader.service';
import { BusinessResolver } from './shared/resolvers/business.resolver';
import { CollectionsDataService } from './shared/services/collections-data.service';
import { DataGridService } from './products-list/services/data-grid/data-grid.service';
import { ProductsListService } from './products-list/services/products-list.service';
import { ImportApiService } from './products-list/services/import/import-api.service';

import { ApolloModule } from 'apollo-angular';

export const MediaModuleForRoot = MediaModule.forRoot({});
export const PeAuthModuleForRoot = AuthModule.forRoot();
export const I18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();

@NgModule({
  imports: [
    CommonModule,
    ApolloModule,
    ApolloConfigModule,
    FormsModule,
    ReactiveFormsModule,
    SnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    HammerModule,
    MediaModuleForRoot,
    PeAuthModuleForRoot,
    ProductsRouterModule,
    I18nModuleForChild,

    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
  ],
  providers: [
    ProductsApiService,
    DialogService,
    ChannelTypeIconService,
    EnvService,
    ImagesUploaderService,
    BusinessResolver,
    CollectionsDataService,
    DataGridService,
    ProductsListService,
    MediaUrlPipe,
    ImportApiService,
  ],
  exports: [
    ProductsComponent,
  ],
  declarations: [
    ProductsComponent,
  ],
})
export class ProductsModule {}
