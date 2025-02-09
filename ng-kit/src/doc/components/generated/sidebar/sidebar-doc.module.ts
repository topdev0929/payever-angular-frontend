import { NgModule } from '@angular/core';
import { SidebarDocComponent } from './sidebar-doc.component';
import {
  SidebarDefaultExampleComponent,
  SidebarFixedExampleComponent,
  SidebarModalExampleComponent,
  SidebarTransparentExampleComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SidebarModule } from '../../../../kit/sidebar/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SidebarModule
  ],
  declarations: [
    SidebarDocComponent,
    SidebarDefaultExampleComponent,
    SidebarFixedExampleComponent,
    SidebarModalExampleComponent,
    SidebarTransparentExampleComponent
  ]
})
export class SidebarDocModule {
}
