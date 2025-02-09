import { NgModule } from '@angular/core';
import { AppIconDocComponent } from './app-icon/app-icon-doc.component';
import { DesktopDockerDocComponent } from './desktop-docker/desktop-docker-doc.component';
import { MobileDockerDocComponent } from './mobile-docker/mobile-docker-doc.component';
import { DashboardDocComponent } from './dashboard-doc.component';
import { DockerService } from './services';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { Notification2Module } from '../../../../kit/notification2/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    Notification2Module
  ],
  declarations: [
    AppIconDocComponent,
    DesktopDockerDocComponent,
    MobileDockerDocComponent,
    DashboardDocComponent
  ],
  providers: [DockerService]
})
export class DashboardDocModule {
}
