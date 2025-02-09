import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDE from '@angular/common/locales/en-DE';
import { NgModule, ErrorHandler } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { PebAbstractThemeApi } from '@pe/builder-core';
import { EnvironmentConfigModule } from '@pe/ng-kit/modules/environment-config';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { LocalStorageModule } from '@pe/ng-kit/modules/local-storage';
import { MicroModule } from '@pe/ng-kit/modules/micro';
import { PlatformHeaderModule } from '@pe/ng-kit/modules/platform-header';
import { SessionStorageModule } from '@pe/ng-kit/modules/session-storage/index';
import { PeStepperModule } from '@pe/stepper';
import { BuilderThemeApi } from '../../../modules-new/+builder/api/theme.api';
import { SnackbarComponent } from '../../../modules-new/+builder/components/snackbar/snackbar.component';
import { CoreApolloModule } from '../../../modules-new/core/core-apollo.module';
import { NewCoreModule as BuilderCoreModule } from '../../../modules-new/core/core.module';
import { DevModule } from '../../../modules-new/dev/dev.module';
import { AppRoutingModule } from './app.routing';
import { RootComponent } from './components/root.component';

registerLocaleData(localeDE, 'en-DE');

export class HammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement): any {
    const instance: HammerConfig = new (window as any).Hammer(element, { touchAction: 'pan-y' });
    const destroyHandler: () => void = () => {
      // console.info('leak new HammerJS', instance);
      window.removeEventListener('pe-destroy-micro-app', destroyHandler);
      (instance as any).destroy();
    };
    window.addEventListener('pe-destroy-micro-app', destroyHandler);

    return instance;
  }
}

@NgModule({
  imports: [
    CoreApolloModule,
    LocalStorageModule.provide(),
    PlatformHeaderModule.forRoot(),
    SessionStorageModule.provide(),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatSnackBarModule,
    NgxWebstorageModule.forRoot(),
    EnvironmentConfigModule.forRoot(),
    I18nModule.forRoot({ useStorageForLocale: true }),
    MicroModule.forRoot(),
    PlatformHeaderModule.forRoot(),
    NgxWebstorageModule.forRoot({
      prefix: 'pe.test',
      separator: '.',
      caseSensitive: true,
    }),
    BuilderCoreModule,
    PeStepperModule.forRoot(),

    DevModule,
  ],
  declarations: [
    RootComponent,
    SnackbarComponent,
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig,
    },
    MatSnackBar,
    {
      provide: PebAbstractThemeApi,
      useClass: BuilderThemeApi,
    }
  ],
  entryComponents: [SnackbarComponent],
  bootstrap: [RootComponent],
})

export class AppModule {
}
