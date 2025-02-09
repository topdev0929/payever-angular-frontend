import { NgModule } from '@angular/core';

import { MessageBus } from '@pe/common';

import { SandboxMessageBus } from './services/message-bus.service';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    }
  ]
})
export class SharedModule {}
