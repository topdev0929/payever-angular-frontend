import { NgModule } from '@angular/core';

import { WindowSizesService, WindowEventsService, WindowStylesService } from './services';

// @dynamic
@NgModule({
  providers: [
    WindowSizesService,
    WindowStylesService,
    WindowEventsService,
  ],
})
export class WindowModule {
}
