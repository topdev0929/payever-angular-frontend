import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

import {
  PebAbstractThemeApi,
  PebThemeCollectionStore,
} from '@pe/builder-core';
import { ViewerModule as PeViewerModule } from '@pe/builder-editor/projects/modules/viewer/src';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule as PeMediaModule } from '@pe/ng-kit/modules/media';
import { OverlayBoxModule as PeOverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';
import { WindowModule as PeWindowModule } from '@pe/ng-kit/modules/window';
import { SharedModule } from '../shared/shared.module';
import { ThemeFiltersComponent } from './components/filters/filters.component';
import { PreviewDeviceFrameComponent } from './components/preview-device-frame/preview-device-frame.component';
import { ThemeCardComponent } from './components/theme-card/theme-card.component';
import { ThemePlusComponent } from './components/theme-plus/theme-plus.component';
import { ThemePreviewComponent } from './components/theme-preview/theme-preview.component';
import { ClearActionsComponent } from './routes/clear-actions/clear-actions.component';
import { ListAllComponent } from './routes/list-all/list-all.component';
import { ListCategoryComponent } from './routes/list-category/list-category.component';
import { ListUsersComponent } from './routes/list-users/list-users.component';
import { ListComponent } from './routes/list/list.component';
import { themesRoutes } from './themes.routing';

const themesStoreFactory = (api: PebAbstractThemeApi) => {
  return new PebThemeCollectionStore(api);
};

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(themesRoutes),
    MatButtonModule,
    MatButtonToggleModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    PeOverlayBoxModule,
    PeWindowModule,
    PeMediaModule,
    SharedModule,
    SnackBarModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule,
    PeViewerModule,
    CdkTreeModule,
    MatSelectModule,
    I18nModule,
  ],
  declarations: [
    ListComponent,
    ListUsersComponent,
    ListAllComponent,
    ListCategoryComponent,
    ThemeCardComponent,
    ThemePlusComponent,
    ClearActionsComponent,
    ThemePreviewComponent,
    PreviewDeviceFrameComponent,
    ThemeFiltersComponent,
  ],
  entryComponents: [
    ThemePreviewComponent,
  ],
  providers: [
    {
      provide: PebThemeCollectionStore,
      useFactory: themesStoreFactory,
      deps: [PebAbstractThemeApi],
    },
  ],
})
export class ThemesModule { }
