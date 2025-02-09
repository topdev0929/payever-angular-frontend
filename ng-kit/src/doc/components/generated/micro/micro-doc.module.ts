import { NgModule } from '@angular/core';
import { MessageBusServiceDocComponent } from './message-bus-service-doc.component';
import { MicroAddonDocComponent } from './micro-addon-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { MicroModule } from '../../../../kit/micro/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    MicroModule
  ],
  declarations: [
    MessageBusServiceDocComponent,
    MicroAddonDocComponent
  ]
})
export class MicroDocModule {
}
