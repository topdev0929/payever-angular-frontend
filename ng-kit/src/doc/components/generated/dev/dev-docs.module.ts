import { NgModule } from '@angular/core';

import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DevModule } from '../../../../kit/dev';

import {
  DevModeServiceDocsComponent,
  DevModeServiceInUseComponent,
  DevModeServiceStubDocsComponent,
} from './components';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DevModule
  ],
  declarations: [
    DevModeServiceDocsComponent,
    DevModeServiceInUseComponent,
    DevModeServiceStubDocsComponent,
  ]
})
export class DevDocsModule {}
