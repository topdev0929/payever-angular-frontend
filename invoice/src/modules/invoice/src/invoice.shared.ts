import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
// import { InvoiceCreateComponent } from './routes/create/invoice-create.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    // AbbreviationPipe,
    // InvoiceCreateComponent,
  ],
  exports: [
    // AbbreviationPipe,
    // InvoiceCreateComponent,
  ]
})
export class PeInvoiceSharedModule {}
