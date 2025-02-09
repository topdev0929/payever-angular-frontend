import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebFormBackgroundModule, PebFormFieldTextareaModule } from '@pe/ui';

import { PeSettingsGoogleAnalyticsComponent } from './google-analytics.component';


@NgModule({
  imports: [
    CommonModule,
    PebFormBackgroundModule,
    PebFormFieldTextareaModule,
  ],
  declarations: [
    PeSettingsGoogleAnalyticsComponent,
  ],
  exports: [
    PeSettingsGoogleAnalyticsComponent,
  ],
})
export class PeSettingsGoogleAnalyticsModule {
}
