import { NgModule } from '@angular/core';

import { WindowModule } from '@pe/checkout/window';

import { SnackBarShowerComponent } from './components';
import { SafeUrlPipe } from './pipes';
import { PluginEventsService } from './services/plugin-events.service';

@NgModule({
  imports: [
    WindowModule,
  ],
  declarations: [
    SnackBarShowerComponent,
    SafeUrlPipe,
  ],
  exports: [
    SnackBarShowerComponent,
    SafeUrlPipe,
  ],
  providers: [
    PluginEventsService,
  ],
})
export class PluginsModule {
}
