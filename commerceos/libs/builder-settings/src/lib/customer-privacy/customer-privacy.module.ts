import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebButtonToggleModule, PebExpandablePanelModule } from '@pe/ui';

import { PeSettingsCustomerPrivacyComponent } from './customer-privacy.component';


@NgModule({
  imports: [
    FormsModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
  ],
  declarations: [
    PeSettingsCustomerPrivacyComponent,
  ],
  exports: [
    PeSettingsCustomerPrivacyComponent,
  ],
})
export class PeSettingsCustomerPrivacyModule {
}
