import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  PE_MESSAGE_API_PATH,
  PE_PRODUCTS_API_PATH,
  PE_MEDIA_API_PATH,
  PeMessageEnvService,
  PeMessageModule,
} from '@pe/message';

import { AppComponent } from './app.component';
import { EmbedMessageBus } from './services/message-bus.service';

(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'commerceos',
  'messaging',
  'set',
]);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: '', component: AppComponent }]),

    PeMessageModule,
  ],
  providers: [
    TranslateService,
    {
      provide: MessageBus,
      useClass: EmbedMessageBus,
    },
    {
      provide: EnvService,
      useClass: PeMessageEnvService,
    },
    {
      provide: PE_ENV,
      useFactory: () => {
        return {
          custom: {
            i18n: 'MICRO_URL_PHP_TRANSLATION',
            cdn: 'MICRO_URL_CUSTOM_CDN',
            widgetsCdn: 'MICRO_URL_WIDGETS_CDN',
            translation: 'MICRO_URL_TRANSLATION_STORAGE',
            storage: 'MICRO_URL_CUSTOM_STORAGE',
          },
          backend: {
            media: 'MICRO_URL_MEDIA',
            message: 'MICRO_URL_MESSAGE',
            products: 'MICRO_URL_PRODUCTS',
          },
          frontend: {
            commerceos: 'MICRO_URL_FRONTEND_COMMERCEOS',
          },
        };
      },
    },
    {
      provide: PE_MEDIA_API_PATH,
      useValue: 'MICRO_URL_MEDIA',
    },
    {
      provide: PE_MESSAGE_API_PATH,
      useValue: 'MICRO_URL_MESSAGE',
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      useValue: 'MICRO_URL_PRODUCTS',
    },
    {
      provide: APP_BASE_HREF,
      useValue : '/',
    },
  ],
})
export class AppModule {

  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
    const embed = createCustomElement(AppComponent, { injector: this.injector });

    customElements.define('pe-message-webcomponent', embed);
  }

}
