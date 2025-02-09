import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';

import { FormModule as NgKitFormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { StatisticsModule as SdkStatisticsModule } from '@pe/checkout-sdk/sdk/statistics';
import { WrapperAndPaymentsApiModule as SdkApiModule } from '@pe/checkout-sdk/sdk/api';
import { FormUtilsModule } from '@pe/checkout-sdk/sdk/form-utils';
import { EnvironmentConfigModule } from '@pe/ng-kit/modules/environment-config';

import { CustomElementsModule } from './custom-elements/custom-elements.module';
import { AppComponent } from './app.component';
import { DevComponent } from './dev/dev.component';

const routes: Route[] = [
  {
    path: '',
    component: DevComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DevComponent
  ],
  imports: [
    BrowserModule,
    SdkStatisticsModule.forRoot(),
    SdkApiModule,
    FormUtilsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgKitFormModule,
    EnvironmentConfigModule.forRoot(),
    I18nModule.forRoot({useStorageForLocale: true}),
    CustomElementsModule
  ],
  bootstrap: [ AppComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
