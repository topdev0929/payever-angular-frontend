import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebCampaignCreateComponent } from './routes/create/campaign-create.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    PebCampaignCreateComponent,
    AbbreviationPipe,
  ],
  exports: [
    AbbreviationPipe,
    PebCampaignCreateComponent,
  ],
})
export class PebMailSharedModule {}
