import { NgModule } from '@angular/core';
import { DashboardMenuDocComponent } from './dashboard-menu-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DashboardMenuModule } from '../../../../kit/dashboard-menu/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DashboardMenuModule
  ],
  declarations: [DashboardMenuDocComponent]
})
export class DashboardMenuDocModule {
}
