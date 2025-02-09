import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PeDataGridModule } from '@pe/data-grid';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PeFiltersModule } from '@pe/filters';

import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebRadioModule,
  PebSelectModule,
  PebLogoPickerModule,
  PebSocialSharingImageModule,
  PePickerModule,
  PebDateTimePickerModule,
  PebProductPickerModule,
} from '@pe/ui';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { RouterModule } from '@angular/router';
import { ColorPickerModule } from '@pe/color-picker';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { CountryPipe } from './pipes/country.pipe';
import { PebAffiliatesRouteModule } from './affiliates.routing';
import { CountriesPipe } from './pipes/countries.pipe';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { ApolloModule } from 'apollo-angular';
import { AuthModule } from '@pe/auth';
import { PebDashboardComponent } from './routes/dashboard/dashboard.component';
import { PebSettingsComponent } from './routes/settings/settings.component';
import { PebBrandingSettingComponent } from './routes/settings/brading-dialog/branding-dialog.component';
import { PebCustomDomainSettingComponent } from './routes/settings/custom-domain-dialog/custom-domain-dialog.component';
import { PebBankSettingComponent } from './routes/settings/bank-dialog/bank-dialog.component';
import { PebPaymentsSettingComponent } from './routes/settings/payments-dialog/payments-dialog.component';
import { PebAffiliatesComponent } from './routes/root/affiliates-root.component';
import { PebProgramsComponent } from './routes/programs/programs.component';
import { PebNewProgramComponent } from './routes/programs/new-prpgram-modal/new-program.component';
import { PebWelcomeDialogComponent } from './components/welcome-dialog/welcome-dialog.component';
import { WelcomeDialogService } from './components/welcome-dialog/welcome-dialog.service';
import { PeAffiliatesApi } from './api/abstract.affiliates.api';
import { PeActualAffiliatesApi } from './api/actual.affiliates.api';
import { ChannelTypeIconService } from './services/channel-type-icon.service';

export const i18n = I18nModule.forRoot();
export const PeAuthModuleForRoot = AuthModule.forRoot();
export const MediaModuleForRoot = MediaModule.forRoot({});

const uicomp = [
  PebButtonModule,
  PebCheckboxModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
  PebRadioModule,
  PebFormBackgroundModule,
  PebExpandablePanelModule,
  PebButtonToggleModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebMessagesModule,
  PebLogoPickerModule,
  PebSocialSharingImageModule,
  PePickerModule,
  PebDateTimePickerModule,
  PebProductPickerModule,
];

@NgModule({
  declarations: [
    PebAffiliatesComponent,
    PebDashboardComponent,
    PebSettingsComponent,
    CountryPipe,
    CountriesPipe,
    PebProgramsComponent,
    PebNewProgramComponent,
    PebWelcomeDialogComponent,
    PebBrandingSettingComponent,
    PebCustomDomainSettingComponent,
    PebBankSettingComponent,
    PebPaymentsSettingComponent,
  ],
  imports: [
    CommonModule,
    PebAffiliatesRouteModule,
    PeDataGridModule,
    PeSidebarModule,
    PeFiltersModule,
    MatMomentDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    PePlatformHeaderModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatTableModule,
    MatAutocompleteModule,
    MatDatepickerModule,

    ...uicomp,
    i18n,
    MediaModuleForRoot,
    PeAuthModuleForRoot,
    ApolloModule,
    DragDropModule,
    RouterModule,
    ColorPickerModule,
    HttpLinkModule,
  ],
  providers: [
    WelcomeDialogService,
    MediaUrlPipe,
    ChannelTypeIconService,
    { provide: PeAffiliatesApi, useClass: PeActualAffiliatesApi }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class PebAffiliatesModule {}
