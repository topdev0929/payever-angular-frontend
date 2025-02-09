import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PeDataGridModule } from '@pe/data-grid';
import { I18nModule } from '@pe/i18n';
import {
    PebButtonModule, PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule, PebMessagesModule, PebSelectModule, PePickerModule,
} from '@pe/ui';
import { EmployeesListStatusButtonsComponent } from './components/employees-list-status-buttons/employees-list-status-buttons.component';
import { NewEmployeeDialogComponent } from './components/new-employee-dialog/new-employee-dialog.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';
import { PebBusinessEmployeesService } from './services/business-employees/business-employees.service';
import { PebEmployeeSidebarService } from './services/sidebar/employee-sidebar.service';

import { MatDialogModule } from '@angular/material/dialog';
import { AuthModule } from '@pe/auth';
import { PeSidebarModule } from '@pe/sidebar';
import { DeleteWindowsConfirmationComponent } from '../dialogs/delete-item-confirm/delete-confirm.component';
import { EmployeeAppAccessSetterComponent } from './components/employee-app-access-setter/employee-app-access-setter.component';
import { PebBusinessEmployeesStorageService } from './services/business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogFormService } from './services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogOpenerService } from './services/employee-dialog-opener/peb-employee-dialog-opener.service';
import { PebEmployeeDialogService } from './services/employee-dialog/peb-employee-dialog.service';
import { PebEmployeesGridSortHelperService } from './services/employee-grid-sorting-helper/employees-grid-sorting-helper.service';
import { PebGridDataConverterService } from './services/grid-data-converter/peb-grid-data-converter.service';
import { ComponentModule } from '../component.module';
import { PeInputPickerModule } from '../input-picker/input-picker.module';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { NewEmployeeGroupComponent } from './components/new-employee-group/new-employee-group.component';

@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeesListStatusButtonsComponent,
    NewEmployeeDialogComponent,
    EmployeeAppAccessSetterComponent,
    DeleteWindowsConfirmationComponent,
    NewEmployeeGroupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    I18nModule,
    AuthModule,
    PeDataGridModule,
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

  ],
})
export class EmployeesModule { }
