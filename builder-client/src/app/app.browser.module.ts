import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';

import { AppModule } from './app.module';
import { RootComponent } from './components';
import { StateTransferInitializerModule } from '@nguniversal/common';

// the Request object only lives on the server
export function getRequest(): any {
  return { headers: { cookie: document.cookie } };
}

declare var location: any;

@NgModule({
  bootstrap: [RootComponent],
  imports: [
    AppModule,
    StateTransferInitializerModule,
    BrowserTransferStateModule,
  ],
  providers: [
    {
      // The server provides these in main.server
      provide: REQUEST,
      useFactory: getRequest,
    },
    {
      provide: 'ORIGIN_URL',
      useValue: location ? location.origin : null,
    },
    // NOTE: this provider needed for server-side rendering to build markup for specific screen size.
    // For SSR device type injected from server.ts. For client side code - device type not needed
    {
      provide: 'DEVICE_TYPE',
      useValue: null
    },
    // NOTE: this provider may contain domain name of builder client: for shop it is like shopname
    // Prerender.ts provides real value to generate html, but client side code will take this info from url
    {
      provide: 'CLIENT_DOMAIN',
      useValue: null
    }
  ],
})
export class AppBrowserModule {}
