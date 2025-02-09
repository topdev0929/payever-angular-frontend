import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebButtonToggleModule } from '@pe/ui';

import { PeSettingsSpamProtectionComponent } from './spam-protection.component';

@NgModule({
  imports: [
    FormsModule,
    PebButtonToggleModule,
  ],
  declarations: [
    PeSettingsSpamProtectionComponent,
  ],
  exports: [
    PeSettingsSpamProtectionComponent,
  ],
})
export class PeSettingsSpamProtectionModule {
}
