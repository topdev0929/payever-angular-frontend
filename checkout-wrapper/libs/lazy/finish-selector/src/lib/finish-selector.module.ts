import { Overlay } from '@angular/cdk/overlay';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';

import { FinishSelectorService } from './finish-selector.service';


@NgModule({
  imports: [],
  providers: [
    Overlay,
    FinishSelectorService,
  ],
})
export class FinishSelectorModule {
  static withConfig(providers: Provider[]): ModuleWithProviders<FinishSelectorModule> {
    return {
      ngModule: FinishSelectorModule,
      providers,
    };
  }
}
