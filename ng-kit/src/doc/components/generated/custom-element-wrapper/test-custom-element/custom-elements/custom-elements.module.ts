import { NgModule, Injector } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { I18nModule } from '../../../../../../../modules/i18n';
import { EnvironmentConfigModule } from '../../../../../../../modules/environment-config';
import { CustomElementModule } from '../../../../../../../modules/custom-element-wrapper';

import { TestCustomElementModule, TestCustomElementComponent } from './test-custom-element';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    I18nModule.forRoot({useStorageForLocale: true}),
    NgxWebstorageModule.forRoot(),
    EnvironmentConfigModule.forRoot(),
    RouterModule.forRoot([]),
    CustomElementModule,

    TestCustomElementModule
  ],
  entryComponents: [
    TestCustomElementComponent
  ]
})
export class CustomElementsModule {

  constructor(private injector: Injector) {
    if (!customElements.get('pe-test-custom-element')) {
      customElements.define('pe-test-custom-element', createCustomElement(
        TestCustomElementComponent,
        { injector: this.injector })
      );
    }
  }

  ngDoBootstrap(): void {
    // Do not delete, Required at least empty for prod mode.
  }
}
