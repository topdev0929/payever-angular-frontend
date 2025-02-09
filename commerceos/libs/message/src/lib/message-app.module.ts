import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { NavigationService } from '@pe/common';
import {
  PeMessageChatService,
  PeMessageAppService,
  PeMessageWebSocketListenerService ,
} from '@pe/message/shared';
import { WindowEventsService } from '@pe/window';

import { PeMessageModule } from './modules/message/message.module';
import { PeSharedModule } from './modules/shared';
import { TaggingPipe } from './pipes';
import { PeMessageIntegrationService } from './services';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    PeSharedModule,
    PeMessageModule,
  ],
  declarations: [
    TaggingPipe,
  ],
  providers: [
    NavigationService,
    PeMessageIntegrationService,
    PeMessageAppService,
    PeMessageWebSocketListenerService,
    PeMessageChatService,
    WindowEventsService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 250 },
    },
  ],
  exports: [
    PeMessageModule,
  ],
})
export class PeMessageAppModule {
}
