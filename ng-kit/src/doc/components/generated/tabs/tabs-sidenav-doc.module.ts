import { NgModule } from '@angular/core';
import { TabsSidenavDocComponent } from './tabs-sidenav-doc.component';
import { TabsSidenavExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import {TabsModule} from "../../../../kit/tabs/src";

@NgModule({
  imports: [
    DocComponentSharedModule,
    TabsModule
],
  declarations: [
    TabsSidenavDocComponent,
    TabsSidenavExampleDocComponent
  ]
})
export class TabsSidenavDocModule {}
