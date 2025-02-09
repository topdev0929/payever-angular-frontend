import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeMediaEditorModule } from '@pe/media';
import { PeOverlayWidgetService } from "@pe/overlay-widget";
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
} from '@pe/ui';

import { PeThemeEditorComponent } from './components';
import { PeThemesComponent } from './components/themes';
import { PeThemesStyleComponent } from './components/themes/themes-style.component';
import { ThemesApi } from './services';


const routes: Routes = [{
  path: '',
  component: PeThemesComponent,
}];


@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatSnackBarModule,
    PeSidebarModule,
    PeFiltersModule,
    MatTreeModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatIconModule,
    NgxsModule.forFeature([PeGridState]),
    PebFormFieldTextareaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    FormsModule,
    I18nModule.forChild(),
    PeFoldersModule,
    PeGridModule,
    PeMediaEditorModule,
    ConfirmationScreenModule,
  ],
  declarations: [
    PeThemeEditorComponent,
    PeThemesComponent,
    PeThemesStyleComponent,
  ],
  exports: [
    PeThemesComponent,
  ],
  providers: [
    PeFoldersApiService,
    PeFoldersActionsService,
    PeOverlayWidgetService,
    ThemesApi,
  ],
})
export class PebThemesModule {
}
