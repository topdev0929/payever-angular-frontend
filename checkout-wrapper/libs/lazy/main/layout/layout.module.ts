import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnalyticService, AnalyticsFormService } from '@pe/checkout/analytics';
import { PluginsModule } from '@pe/checkout/plugins';

import {
  LayoutComponent,
} from './feature';
import {
  GlobalCustomStylesComponent,
  KitLayoutModule,
  PreventDoubleTapZoomModule,
  TemporaryCdkOverlayStyleFixComponent,
} from './presentation';
import {
  HeaderSelectorComponent,
  MainSelectorComponent,
} from './selectors';


@NgModule({
  declarations: [
    GlobalCustomStylesComponent,
    TemporaryCdkOverlayStyleFixComponent,
    LayoutComponent,

    HeaderSelectorComponent,
    MainSelectorComponent,
  ],
  imports: [
    CommonModule,

    PluginsModule,
    KitLayoutModule,
    PreventDoubleTapZoomModule,
  ],
  exports: [
    LayoutComponent,
  ],
  providers: [
    {
      provide: AnalyticsFormService,
      useClass: AnalyticService,
    },
  ],
})
export class LayoutModule {}
