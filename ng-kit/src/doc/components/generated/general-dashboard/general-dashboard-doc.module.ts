import { NgModule } from '@angular/core';
import { GeneralDashboardDocComponent } from './general-dashboard-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { GeneralDashboardModule } from '../../../../kit/general-dashbord/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    GeneralDashboardModule
  ],
  declarations: [GeneralDashboardDocComponent]
})
export class GeneralDashboardDocModule {
}
