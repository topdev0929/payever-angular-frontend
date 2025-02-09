import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PeAbbreviationPipeModule } from '@pe/shared/pipes';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebLogoPickerModule, PebButtonModule } from '@pe/ui';

import { PeSettingsCreateAppComponent } from './create-app.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebLogoPickerModule,
    PeAbbreviationPipeModule,
    PebButtonModule,
  ],
  declarations: [
    PeSettingsCreateAppComponent,
  ],
  exports: [
    PeSettingsCreateAppComponent,
  ],
})
export class PeSettingsCreateAppModule {
}
