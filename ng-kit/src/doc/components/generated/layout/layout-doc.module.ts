import { NgModule } from '@angular/core';
import { BackDocComponent } from './back-doc.component';
import { LayoutAppDocComponent } from './layout-app-doc.component';
import { LayoutContentDocComponent } from './layout-content-doc.component';
import { LayoutServiceDocComponent } from './layout-service-doc.component';
import { LayoutTabsetDocComponent } from './layout-tabset-doc.component';
import { SpinnerDocComponent } from './spinner-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { LayoutModule } from '../../../../kit/layout/src';

import { LayoutExpandableExampleDocComponent } from './examples';
import { LayoutDocComponent } from './layout-doc.component';

@NgModule({
  imports: [
    DocComponentSharedModule,
    LayoutModule
  ],
  declarations: [
    BackDocComponent,
    LayoutAppDocComponent,
    LayoutContentDocComponent,
    LayoutServiceDocComponent,
    LayoutTabsetDocComponent,
    SpinnerDocComponent,

    LayoutExpandableExampleDocComponent,
    LayoutDocComponent
  ]
})
export class LayoutDocModule {
}
