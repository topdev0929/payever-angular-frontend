import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeSubscriptionApiModule } from './subscription/subscription.api.module';
import { PeSettingsApiModule } from './settings/settings.api.module';
import { PeConnectionApiModule } from './connection/connection.api.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PeSubscriptionApiModule,
    PeSettingsApiModule,
    PeConnectionApiModule,
  ],
})
export class PesApiModule { }
