import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { PluginsModule } from '@pe/checkout/plugins';
import { WindowModule } from '@pe/checkout/window';

import { CatchEveryErrorInterceptor, ApiErrorMessageTransformerService } from './http-interceptors';
import { PaymentProcessingStatusService } from './services';

@NgModule({
  imports: [
    PluginsModule,
    WindowModule,
  ],
  providers: [
    PaymentProcessingStatusService,
    ApiErrorMessageTransformerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CatchEveryErrorInterceptor,
      multi: true,
    },
  ],
})
export class ApiModule {}
