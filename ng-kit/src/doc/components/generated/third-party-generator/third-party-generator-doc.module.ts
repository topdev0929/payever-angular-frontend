import { NgModule, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ThirdPartyGeneratorDocComponent } from './third-party-generator-doc.component';
import {
  ThirdPartyGeneratorAmazonExampleComponent, ThirdPartyGeneratorDhlExampleComponent,
  ThirdPartyGeneratorQrExampleComponent, ThirdPartyGeneratorQrConfigExampleComponent, ThirdPartyGeneratorTwilioExampleComponent,
  ThirdPartyGeneratorStripeExampleComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';

import { ThirdPartyGeneratorModule } from '../../../../kit/third-party-generator/src';
import { ThirdPartyFormModule } from '../../../../kit/third-party-form/src';

import { ThirdPartyGeneratorService } from '../../../../kit/third-party-generator/src/services';

import { ThirdPartyGeneratorStubService } from './services';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ThirdPartyGeneratorModule,
    ThirdPartyFormModule,
    MatButtonModule
  ],
  declarations: [
    ThirdPartyGeneratorDocComponent,
    ThirdPartyGeneratorAmazonExampleComponent,
    ThirdPartyGeneratorDhlExampleComponent,
    ThirdPartyGeneratorQrExampleComponent,
    ThirdPartyGeneratorQrConfigExampleComponent,
    ThirdPartyGeneratorTwilioExampleComponent,
    ThirdPartyGeneratorStripeExampleComponent
  ],
  providers: [
    { provide: ThirdPartyGeneratorService, useValue: new ThirdPartyGeneratorStubService() }
  ]
})
export class ThirdPartyGeneratorDocModule {
}
