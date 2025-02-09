import { NgModule } from '@angular/core';
import { AuthTokenServiceDocComponent } from './auth-token-service-doc.component';
import { EventBusServiceDocComponent } from './event-bus-service-doc.component';
import { LoaderManagerServiceDocComponent } from './loader-manager-service-doc.component';
import { PlatformServiceDocComponent } from './platform-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [
    AuthTokenServiceDocComponent,
    EventBusServiceDocComponent,
    LoaderManagerServiceDocComponent,
    PlatformServiceDocComponent
  ]
})
export class CommonDocModule {
}
