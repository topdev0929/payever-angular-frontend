import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HammerModule } from '@angular/platform-browser';
import { AuthModule } from '@pe/auth';
import { PeDataGridModule } from '@pe/data-grid';
import { I18nModule, PE_TRANSLATION_API_URL } from '@pe/i18n';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebListInfoModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSelectModule, PebSocialSharingImageModule, PePickerModule,
} from '@pe/ui';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxWebstorageModule } from 'ngx-webstorage';
import {
  DeleteBusinessConfirmationComponent,
} from './components/dialogs/delete-business-confirmation/delete-business-confirmation.component';
import { WelcomeDialogComponent } from './components/dialogs/welcome-dialog/welcome-dialog.component';
import { COS_ENV } from './misc/constants';
import { PebBusinessGuard } from './guards/business.guard';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { BusinessResolver, LoadingResolver, UserAccountResolver } from './resolvers';
import { PebSettingsComponent } from './routes/_root/settings-root.component';
import { BusinessDetailComponent } from './routes/business-detail/business-detail.component';
import { BusinessInfoComponent } from './routes/business-info/business-info.component';
import {
  ApiService,
  BackRoutingService,
  BusinessEnvService,
  PebWallpapersService, PebWallpaperStorageService,
  ValidationErrorsMapperService,
  WallpaperGridItemConverterService,
} from './services';
import { SettingsAppComponent } from './settings-app.component';
import { SettingsRoutingModule } from './settings-routing.module';

import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { ComponentModule } from './components/component.module';
import { CloseWindowsConfirmationComponent } from './components/dialogs/exit-confirm/exit-confirm.component';
import { PeInputPickerModule } from './components/input-picker/input-picker.module';
import { AppearanceModule } from './routes/appearance/appearance.module';
import { GeneralComponent } from './routes/general/general.component';
import { PoliciesComponent } from './routes/policies/policies.component';
import { WallpapersComponent } from './routes/wallpapers/wallpapers.component';
import { BackgroundService } from './services/background.service';
import { CoreConfigService } from './services/config.service';
import { InfoBoxService } from './services/info-box.service';
import { TokenInterceptor } from './services/interceptor';
import { SettingsSidebarService } from './services/settings-sidebar.service';
import { PebWallpaperGridSortHelperService } from './services/wallpaper-grid-sorting-helper.service';
import { PebWallpaperSidebarService } from './services/wallpaper-sidebar.service';
import { SnackbarService } from '@pe/snackbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const auth = AuthModule.forRoot();
export const media = MediaModule.forRoot();
export const i18n = I18nModule.forRoot();
export const ngxWebStorage = NgxWebstorageModule.forRoot();

// @dynamic
@NgModule({
  declarations: [
    SettingsAppComponent,
    PebSettingsComponent,
    PoliciesComponent,
    BusinessInfoComponent,
    BusinessDetailComponent,
    GeneralComponent,
    DeleteBusinessConfirmationComponent,
    WelcomeDialogComponent,
    CloseWindowsConfirmationComponent,
    WallpapersComponent,
  ],
  imports: [
    auth,
    SettingsRoutingModule,
    i18n,
    PePlatformHeaderModule,
    ngxWebStorage,
    HammerModule,
    ClipboardModule,
    PebSocialSharingImageModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebButtonModule,
    PebLogoPickerModule,
    OverlayWidgetModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgScrollbarModule,
    MatFormFieldModule,
    MatMenuModule,
    PeSidebarModule,
    PeDataGridModule,
    MatSlideToggleModule,
    PebListInfoModule,
    PebSelectModule,
    PePickerModule,
    AppearanceModule,
    MatGoogleMapsAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ComponentModule,
    HttpClientModule,
    MatExpansionModule,
    MatListModule,
    media,
    PeInputPickerModule,
    MatSnackBarModule,
  ],
  providers: [
    BusinessResolver,
    SnackbarService,
    SettingsSidebarService,
    BusinessEnvService,
    InfoBoxService,
    BackRoutingService,
    ValidationErrorsMapperService,
    AbbreviationPipe,
    PebBusinessGuard,
    UserAccountResolver,
    LoadingResolver,
    PeOverlayWidgetService,
    CoreConfigService,
    PebWallpapersService,
    PebWallpaperStorageService,
    WallpaperGridItemConverterService,
    MediaUrlPipe,
    PebWallpaperSidebarService,
    BackgroundService,
    PebWallpaperGridSortHelperService,
    ApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PE_TRANSLATION_API_URL,
      deps: [COS_ENV],
      useFactory: env => env.custom.translation,
    },
  ],
})
export class SettingsModule {
  constructor(
    backRouting: BackRoutingService,
  ) {
    backRouting.handle();
  }
}
