import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgxsModule } from '@ngxs/store';

import { ContactsState } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeWidgetsModule } from '@pe/widgets';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import {
  OverlayWidgetModule,
  PeOverlayWidgetService,
  PE_OVERLAY_DATA,
} from '@pe/overlay-widget';
import {
  PebCountryPickerModule,
  PebFormFieldInputModule,
  PebSelectModule,
} from '@pe/ui';

import { GroupsGQLService } from './services/groups-gql.service';
import {
  ContactsGQLService,
  ContactsService,
  ContactsStoreService,
  FieldsGQLService,
  SearchOverlayService,
} from './services';
import { GraphQLModule } from './graphql/graphql.module';
import { ContactComponent } from './components/contact/contact.component';
import { AssetsComponent } from './components/assets/assets.component';
import { FieldGroupGqlService } from './services/field-group-gql.service';
import { mockData, MOCK_DATA } from './services/mock/mock-injection-tokens';
import { ContactsRoutingModule } from './contacts-routing.module';
import { ContactsSnackbarComponent } from './components/snackbar/snackbar.component';
import { SearchOverlayComponent } from './components/search-overlay/search-overlay.component';
import { GroupContactsGQLService } from './services/group-contacts-gql.service';
import { GoogleAutocompleteDirective } from './directives/google-autocomplete.directive';
import { GoogleAutocompleteService } from './services/address/google-autocomplete.service';
import { MockFieldGroupGqlService } from './services/mock/mock-field-group-gql.service';
import { MockFieldsGqlService } from './services/mock/mock-fields-gql.service';
import { MockGroupsGQLService } from './services/mock/mock-groups-gql.service';
import { MockGroupContactsGqlService } from './services/mock/mock-group-contacts-gql.service';
import { DialogsService } from './services/dialogs.service';
import { UploaderService } from './services/uploader.service';
import { PeContactsListComponent } from './routes/contacts-list/contacts-list.component';
import { PeContactsLayoutComponent } from './routes/root/contacts-layout.component';
import { ContactsWidgetComponent } from './components/contacts-widget/contacts-widget.component';
import { EmployeesCellComponent } from './components/employees-cell/employees-cell.component';
import { PebContactsTreeComponent } from './components/tree/contacts-tree.component';
import { ValidationErrorsMapperService } from './services/validation-errors-mapper.service';
import { CloseWindowsConfirmationComponent } from './components/close-window-confirm/close-window-confirm.component';

export const i18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();
export const ngxsFeatureModule = NgxsModule.forFeature([ContactsState]);

@NgModule({
  declarations: [
    ContactComponent,
    AssetsComponent,
    PeContactsLayoutComponent,
    PeContactsListComponent,
    ContactsWidgetComponent,
    SearchOverlayComponent,
    CloseWindowsConfirmationComponent,
    ContactsSnackbarComponent,
    GoogleAutocompleteDirective,
    EmployeesCellComponent,
    PebContactsTreeComponent,
  ],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatIconModule,
    MatSidenavModule,
    MatTreeModule,
    ScrollingModule,

    GraphQLModule,

    PeDataGridModule,
    PeSidebarModule,
    PeWidgetsModule,
    PebSelectModule,
    PebCountryPickerModule,
    PebFormFieldInputModule,
    OverlayWidgetModule,
    ClipboardModule,
    i18nModuleForChild,
    ngxsFeatureModule,
  ],
  providers: [
    ContactsService,
    SearchOverlayService,
    DialogsService,
    UploaderService,
    ContactsGQLService,
    FieldsGQLService,
    FieldGroupGqlService,
    GroupsGQLService,
    GroupContactsGQLService,
    PeOverlayWidgetService,
    ValidationErrorsMapperService,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    { provide: FieldGroupGqlService, useClass: MockFieldGroupGqlService }, // todo: comment out mock API for production
    { provide: FieldsGQLService, useClass: MockFieldsGqlService },
    { provide: GroupsGQLService, useClass: MockGroupsGQLService },
    { provide: GroupContactsGQLService, useClass: MockGroupContactsGqlService },
    { provide: MOCK_DATA, useValue: mockData },
    ContactsStoreService,
    GoogleAutocompleteService,
    {
      provide: 'Window',
      useValue: window,
    },
  ],
  exports: [
    PeContactsListComponent,
  ]
})
export class ContactsModule {}
