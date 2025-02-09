import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Type, NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AbstractBaseWidgetModule,
  BaseWidgetCustomElementComponent,
} from '@pe/checkout/payment-widgets';
import { SnackBarModule } from '@pe/checkout/ui/snackbar';

import {
  IvyCustomElementComponent,
  IvyIframeComponent,
  IvyWidgetComponent,
  TooltipComponent,
  TooltipDialogComponent,
  TooltipStyleComponent,
} from './components';
import { IvyWidgetApiService, IvyWidgetService } from './services';

@NgModule({
  declarations: [
    IvyCustomElementComponent,
    IvyWidgetComponent,
    TooltipComponent,
    TooltipDialogComponent,
    TooltipStyleComponent,
    IvyIframeComponent,
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    SnackBarModule,
    OverlayModule,
  ],
  providers: [
    IvyWidgetApiService,
    IvyWidgetService,
  ],
})
export class IvyWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<BaseWidgetCustomElementComponent> {
    return IvyCustomElementComponent;
  }
}
