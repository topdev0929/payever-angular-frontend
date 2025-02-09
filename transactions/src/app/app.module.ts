import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule } from '@pe/ng-kit/modules/auth';
import { BusinessModule } from '@pe/ng-kit/modules/business';
import { CommonModule } from '@pe/ng-kit/modules/common';
import { FullStoryModule } from '@pe/ng-kit/modules/full-story';
import { IconsProviderModule } from '@pe/ng-kit/modules/icons-provider';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroModule } from '@pe/ng-kit/modules/micro';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';
import { EnvironmentConfigModule } from '@pe/ng-kit/modules/environment-config';
import { PlatformHeaderModule } from '@pe/ng-kit/modules/platform-header';

import { AppRoutingModule } from './app-routing.module';
import { MicroReturnComponent, RootComponent } from './components';

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  public buildHammer(element: HTMLElement): any {
    const instance: MyHammerConfig = new (window as any).Hammer(element, { touchAction: 'pan-y' });
    const destroyHandler: () => void = () => {
      // console.info('leak new HammerJS', instance);
      window.removeEventListener('pe-destroy-micro-app', destroyHandler);
      (instance as any).destroy();
    }
    window.addEventListener('pe-destroy-micro-app', destroyHandler);
    return instance;
  }
}

@NgModule({
  imports: [
    AuthModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    IconsProviderModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    ModalModule.forRoot(),
    EnvironmentConfigModule.forRoot(),
    PlatformHeaderModule.forRoot(),
    I18nModule.forRoot({ useStorageForLocale: true }),
    FormsModule,
    BusinessModule,
    CommonModule.forRoot(),
    FullStoryModule,
    MediaModule.forRoot(),
    OverlayBoxModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    MicroModule.forRoot(),
    PePlatformHeaderModule,
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    }
  ],
  declarations: [
    MicroReturnComponent,
    RootComponent
  ],
  bootstrap: [RootComponent]
})
export class AppModule { }
