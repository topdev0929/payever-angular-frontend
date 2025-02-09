import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';

import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PeInvoiceSharedModule } from "../../invoice.shared";
import { RouterModule } from '@angular/router';
import { InvoiceEditorComponent } from './invoice-editor.component';
import { InvoiceThemeGuard } from '../../guards/theme.guard';
import { I18nModule } from '@pe/i18n';
import { PebInvoiceBuilderInsertComponent,
  PebInvoiceBuilderViewComponent,
  PeInvoiceBuilderEditComponent,
  PeInvoiceBuilderPublishComponent
} from '../../components';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: InvoiceEditorComponent,
    canActivate: [InvoiceThemeGuard],
  },
]);

@NgModule({
  declarations: [
    InvoiceEditorComponent,
    PeInvoiceBuilderPublishComponent,
    PebInvoiceBuilderViewComponent,
    PeInvoiceBuilderEditComponent,
    PebInvoiceBuilderInsertComponent,
  ],
  imports: [
    CommonModule,
    PebShopEditorModule,
    I18nModule,
    routerModule,
    PeInvoiceSharedModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
})
export class PeInvoiceEditorModule {}
