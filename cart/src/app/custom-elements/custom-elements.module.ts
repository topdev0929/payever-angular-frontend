import { NgModule, Injector } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ModalModule as NgxModalModule } from 'ngx-bootstrap/modal';

import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { EnvironmentConfigModule, EnviromentConfigModuleConfigInterface, ENV_CONFIG_TOKEN } from '@pe/ng-kit/modules/environment-config';
import { MicroModule } from '@pe/ng-kit/modules/micro';

import { ProductsModule } from '@pe/checkout-sdk/sdk/products';

import { CartEditModule, CartEditComponent } from './cart-edit';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxWebstorageModule.forRoot(),
    NgxModalModule.forRoot(),
    I18nModule.forRoot({useStorageForLocale: true}),
    EnvironmentConfigModule.forRoot(),
    RouterModule.forRoot([]),
    MicroModule.forRoot(),
    ProductsModule,

    CartEditModule
  ],
  entryComponents: [
    CartEditComponent
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue : '/' },
    { provide: ENV_CONFIG_TOKEN, useValue: { absoluteRootUrl: null } as EnviromentConfigModuleConfigInterface }
  ]
})
export class CustomElementsModule {

  constructor(private injector: Injector) {
    if (!customElements.get('checkout-cart-edit')) {
      customElements.define('checkout-cart-edit', createCustomElement(
        CartEditComponent,
        { injector: this.injector })
      );
    }
  }

  ngDoBootstrap(): void {
    // Do not delete, Required at least empty for prod mode.
  }
}
