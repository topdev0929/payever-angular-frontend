import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxsModule } from '@ngxs/store';

import { PeFoldersModule } from '@pe/folders';
import { FormComponentsColorPickerModule } from '@pe/forms';
import { PeGridModule } from '@pe/grid';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { CommandExecutorService } from '@pe/text-editor';

import { PeCreateInvoiceComponent } from './components/create-invoice/create-invoice.component';
import { EditFolderComponent } from './components/edit-folder/edit-folder.component';
import { EditPictureComponent } from './components/edit-pictures/edit-picture.component';
import { PeInvoiceSettingsEmailComponent } from './components/email/email.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PeInvoiceSettingsRemindersComponent } from './components/reminders/reminder.component';
import { PeInvoiceSnackbarComponent } from './components/snackbar/snackbar.component';
import { PebInvoiceGuard } from './guards/invoice.guard';
import { PeInvoiceRouteModule } from './invoice.routing';
import { PeInvoiceSharedModule } from './invoice.shared';
import { PeInvoiceMaterialModule } from './misc/material/material.module';
import { FilterPipe } from './pipes/filter.pipe';
import { ThemesMediaUrlPipe } from './pipes/media-url.pipe';
import { InvoiceResolver } from './resolver/invoice.resolver';
import { PeInvoiceComponent } from './routes/_root/invoice-root.component';
import { PebInvoiceGridService } from './routes/grid/invoice-grid.service';
import { InvoicesAppState } from './routes/grid/store/invoices.state';
import { PeInvoiceSettingsComponent } from './routes/settings/settings.component';
import { InvoiceApiService } from './services/api.service';
import { CommonService } from './services/common.service';
import { ContactsDialogService } from './services/contacts-dialog.service';
import { InvoiceEnvService } from './services/invoice-env.service';
import { InvoiceFoldersService } from './services/invoice-folder.service';
import { ProductsDialogService } from './services/products-dialog.service';
import { SharedModule } from './shared/modules/shared.module';
import { BusinessResolver } from './shared/resolvers/business.resolver';


@NgModule({
  imports: [
    CommonModule,
    FormComponentsColorPickerModule,
    PeInvoiceRouteModule,
    PeInvoiceSharedModule,
    NgxsModule.forFeature([InvoicesAppState]),
    PeGridModule,
    PeFoldersModule,
    SharedModule,
    PeInvoiceMaterialModule,
  ],
  declarations: [
    ThemesMediaUrlPipe,
    PeInvoiceComponent,
    PeInvoiceSnackbarComponent,
    EditFolderComponent,
    FileUploadComponent,
    FilterPipe,
    PeInvoiceSettingsComponent,
    PeInvoiceSettingsEmailComponent,
    PeInvoiceSettingsRemindersComponent,
    PeCreateInvoiceComponent,
    EditPictureComponent,
  ],
  providers: [
    PebInvoiceGridService,
    PebInvoiceGuard,
    ProductsDialogService,
    ContactsDialogService,
    CommonService,
    BusinessResolver,
    InvoiceResolver,
    CommandExecutorService,
    PeOverlayWidgetService,
    InvoiceApiService,
    InvoiceFoldersService,
    InvoiceEnvService,
    {
      provide: MAT_DIALOG_DATA,
      useValue: {},
    },
  ],
})
export class PeInvoiceModule {
}
