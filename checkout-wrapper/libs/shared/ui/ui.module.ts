import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentModule } from '@pe/checkout/ui/progress-button-content';

import { ElementOverlayContainer } from './overlay';

@NgModule({
  imports: [
    CommonModule,
    ContinueButtonModule,
    ProgressButtonContentModule,
  ],
  exports: [
    ContinueButtonModule,
    ProgressButtonContentModule,
  ],
  providers: [
    {
      provide: OverlayContainer,
      useClass: ElementOverlayContainer,
    },
  ],
})
export class UiModule {
}
