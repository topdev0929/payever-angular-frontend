import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnalyticsControlDirective, AnalyticsFormDirective } from './directives';
import { AnalyticsConsentDirective } from './directives/analytics-consent.directive';

@NgModule({
  declarations: [
    AnalyticsConsentDirective,
    AnalyticsControlDirective,
    AnalyticsFormDirective,
  ],
  imports: [CommonModule],
  exports: [AnalyticsConsentDirective, AnalyticsControlDirective, AnalyticsFormDirective],
})
export class AnalyticsModule {}
