import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeDataGridModule } from '@pe/data-grid';
import { PebThemesModule } from '@pe/themes';

import { PeInvoiceRouteModule } from './invoice.routing';
import { PeInvoiceSharedModule } from './invoice.shared';

import { PeInvoiceAutocompleteModule } from './routes/edit/components/autocomplete/invoice-autocomplete.module';

import { PeInvoiceEditComponent } from './routes/edit/invoice-edit.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormComponentsColorPickerModule, FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { pebInvoiceElementsConfig } from './config';
import { PeInvoiceMaterialComponent } from './misc/material/material.component';
import { PeInvoiceComponent } from './routes/_root/invoice-root.component';
import { PeInvoiceGridComponent } from './routes/grid/invoice-grid.component';
import { PeInvoiceSettingsComponent } from './routes/settings/settings.component';
import { PebThemeGridComponent } from './routes/theme-grid/theme-grid.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxsModule } from '@ngxs/store';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSelectModule
  // PebProductPickerModule
} from '@pe/ui';
import { PeCreateInvoiceComponent } from './components/create-invoice/create-invoice.component';
import { EditFolderComponent } from './components/edit-folder/edit-folder.component';
import { EditPictureComponent } from './components/edit-pictures/edit-picture.component';
import { PeInvoiceSettingsEmailComponent } from './components/email/email.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PebProductPickerModule } from './components/product-picker/product-picker.module';
import { PeInvoiceSettingsRemindersComponent } from './components/reminders/reminder.component';
import { PebInvoiceSnackbarComponent } from './components/snackbar/snackbar.component';
import { CommandExecutorService, TextEditorComponent, TextEditorToolbarComponent } from './components/texteditor';
import { PebInvoiceGuard } from './guards/invoice.guard';
import { FilterPipe } from './pipes/filter.pipe';
import { PebInvoiceGridService } from './routes/grid/invoice-grid.service';
import { InvoicesAppState } from './routes/grid/store/invoices.state';
import { CommonService } from './services/common.service';
import { ContactsDialogService } from './services/contacts-dialog.service';
import { InvoiceEnvService } from './services/invoice-env.service';
import { ProductsDialogService } from './services/products-dialog.service';
import { TokenInterceptor } from './token.interceptor';
import { PebActualContextApi, PebContextApi } from '@pe/builder-api';

export const PebViewerModuleForRoot: any = PebViewerModule.withConfig(pebInvoiceElementsConfig);
export const ngxsModule = NgxsModule.forFeature([InvoicesAppState]);
export const i18n = I18nModule.forRoot();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebProductPickerModule,
    PeInvoiceAutocompleteModule,
    FormComponentsColorPickerModule,
    PeInvoiceRouteModule,
    PeInvoiceSharedModule,
    MatNativeDateModule,
    MatMomentDateModule,
    FormModule,
    ngxsModule,
    PebViewerModuleForRoot,
    PeDataGridModule,
    NgScrollbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    PeSidebarModule,
    PebThemesModule,
    PebButtonToggleModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebExpandablePanelModule,
    PebFormFieldTextareaModule,
    PebButtonModule,
    PebMessagesModule,
    PebLogoPickerModule,
    PebSelectModule,
    i18n
  ],
  declarations: [
    PeInvoiceComponent,
    PeInvoiceGridComponent,
    PebInvoiceSnackbarComponent,
    PeInvoiceEditComponent,
    PebThemeGridComponent,
    EditFolderComponent,
    FileUploadComponent,
    FilterPipe,
    PeInvoiceSettingsComponent,
    PeInvoiceMaterialComponent,
    PeInvoiceSettingsEmailComponent,
    PeInvoiceSettingsRemindersComponent,
    PeCreateInvoiceComponent,
    TextEditorComponent,
    TextEditorToolbarComponent,
    EditPictureComponent
  ],
  providers: [
    PebInvoiceGridService,
    PebInvoiceGuard,
    ProductsDialogService,
    ContactsDialogService,
    CommonService,
    CommandExecutorService,
    PeOverlayWidgetService,
    InvoiceEnvService,
    {
      provide: PebContextApi,
      useClass: PebActualContextApi
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ]
})
export class PeInvoiceModule { }
