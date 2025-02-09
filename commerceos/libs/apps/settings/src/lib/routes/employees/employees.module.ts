import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { NgxsModule } from '@ngxs/store';

import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { GridExtensionsImportFileModule } from '@pe/grid/extensions/import-file';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import {
    PebButtonModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule,
    PebMessagesModule,
    PebSelectModule,
    PeInputPickerModule,
    PePickerModule,
} from '@pe/ui';

import { ComponentModule } from '../../components';
import { LogoAndStatusPickerModule } from '../../components/logo-and-status-picker';

import {
  EmployeeAppAccessSetterComponent,
  EmployeesListStatusButtonsComponent,
  NewEmployeeDialogComponent,
  NewEmployeeGroupComponent,
} from './components';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';
import {
  PebBusinessEmployeesStorageService,
  PebBusinessEmployeesService,
  PebEmployeeDialogFormService,
  PebEmployeeDialogOpenerService,
  PebEmployeeDialogService,
  PebEmployeesGridSortHelperService,
  PebGridDataConverterService,
  PebEmployeeSidebarService,
  EmployeeGroupService,
  EmployeeFolderService,
} from './services';
import { PebEmployeesState } from './state/employees';

export const pebElementSelectionState = NgxsModule.forFeature([PebEmployeesState]);

@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeesListStatusButtonsComponent,
    NewEmployeeDialogComponent,
    EmployeeAppAccessSetterComponent,
    NewEmployeeGroupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    I18nModule,
    PeGridModule,
    PeFoldersModule,
    PeSidebarModule,
    MatIconModule,
    MatDialogModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebButtonModule,
    PebLogoPickerModule,
    PebSelectModule,
    PebButtonToggleModule,
    PePickerModule,
    ComponentModule,
    PeInputPickerModule,
    PebMessagesModule,
    MatGoogleMapsAutocompleteModule,
    ConfirmationScreenModule,
    GridExtensionsImportFileModule,
    pebElementSelectionState,
    LogoAndStatusPickerModule,
  ],
  providers: [
    PebEmployeeSidebarService,
    PebBusinessEmployeesService,
    PebEmployeeDialogOpenerService,
    PebEmployeeDialogService,
    PebEmployeeDialogFormService,
    PebGridDataConverterService,
    PebEmployeesGridSortHelperService,
    PebBusinessEmployeesStorageService,
    EmployeeGroupService,
    EmployeeFolderService,
  ],
})
export class EmployeesModule { }
