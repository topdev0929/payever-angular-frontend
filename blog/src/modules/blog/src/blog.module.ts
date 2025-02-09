import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeSidebarModule } from '@pe/sidebar';
import { PeDataGridModule } from '@pe/data-grid';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PebThemesModule } from '@pe/builder-themes';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSocialSharingImageModule,
} from '@pe/ui';
import { I18nModule } from '@pe/i18n';

import { PebBlogRouteModule } from './blog.routing';
import { PebBlogComponent } from './routes/_root/blog-root.component';
import { pebBlogElementsConfig } from './blog.config';
import { PebBlogDashboardComponent } from './routes/dashboard/blog-dashboard.component';
import { PebBlogSettingsComponent } from './routes/settings/blog-settings.component';
import { PebBlogGuard } from './guards/blog.guard';
import { PebBlogThemesComponent } from './routes/themes/blog-themes.component';
import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from './components';
import { PeBlogMaterialComponent } from './components/material/material.component';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';


// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebViewerModuleForRoot = PebViewerModule.withConfig(pebBlogElementsConfig);
export const i18n = I18nModule.forRoot();


@NgModule({
  imports: [
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
    PebBlogRouteModule,
    OverlayWidgetModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PebThemesModule,
    pebViewerModuleForRoot,
    NgScrollbarModule,
    MatFormFieldModule,
    MatInputModule,
    PeSidebarModule,
    PeDataGridModule,
    MatSlideToggleModule,
    OverlayWidgetModule,
    i18n,
  ],
  declarations: [
    PebBlogThemesComponent,
    PeBlogMaterialComponent,
    PebBlogComponent,
    PebBlogDashboardComponent,
    PebBlogSettingsComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsConnectExistingComponent,
    PeSettingsCreateAppComponent,
    PeSettingsCustomerPrivacyComponent,
    PeSettingsFacebookPixelComponent,
    PeSettingsGoogleAnalyticsComponent,
    PeSettingsPasswordProtectionComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsSocialImageComponent,
    PeSettingsSpamProtectionComponent,
    AbbreviationPipe,
  ],
  providers: [
    PebBlogGuard,
  ],
})
export class PebBlogModule { }
