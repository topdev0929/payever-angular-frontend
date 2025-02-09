import { NgModule, PLATFORM_ID, Optional, Inject } from '@angular/core';
import { DEVICE_TYPE } from './device-type-inject-token';

import { ElementScrollPercentage, WindowService, WindowEventsService } from './services';
import { createWindowServiceFactory } from './lib';

@NgModule({
  providers: [
    ElementScrollPercentage,
    WindowEventsService,
    { provide: WindowService, useFactory: createWindowServiceFactory, deps: [PLATFORM_ID, WindowEventsService, [new Optional(), new Inject(DEVICE_TYPE)]] },
  ]
})
export class WindowModule {}
