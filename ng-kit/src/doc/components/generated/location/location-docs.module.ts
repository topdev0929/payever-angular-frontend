import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TableModule, LocationModule } from '../../../../kit';
import { DocComponentSharedModule } from '../doc-component-shared.module';

import {
  DocLocationServiceComponent,
  DocLocationServiceInUseComponent,
  DocLocationServiceStubComponent,
  DocTopLocationServiceComponent,
  DocTopLocationServiceInUseComponent,
  DocTopLocationServiceStubComponent,
} from './components';

@NgModule({
  imports: [
    TableModule,
    MatButtonModule,
    DocComponentSharedModule,
    LocationModule,
  ],
  declarations: [
    DocLocationServiceComponent,
    DocLocationServiceInUseComponent,
    DocLocationServiceStubComponent,
    DocTopLocationServiceComponent,
    DocTopLocationServiceInUseComponent,
    DocTopLocationServiceStubComponent,
  ]
})
export class LocationDocsModule {}
