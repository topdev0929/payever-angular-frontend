import { NgModule } from '@angular/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { SidebarLayoutDocComponent } from './sidebar-layout-doc.component';
import {
  SidebarLayoutDefaultDocComponent,
  SidebarLayoutFixedDocComponent,
  SidebarLayoutTransparentDocComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SidebarModule } from '../../../../kit/sidebar/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SidebarModule,
    AccordionModule
  ],
  declarations: [
    SidebarLayoutDocComponent,
    SidebarLayoutDefaultDocComponent,
    SidebarLayoutFixedDocComponent,
    SidebarLayoutTransparentDocComponent
  ]
})
export class SidebarLayoutDocModule {
}
