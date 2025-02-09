import { NgModule } from '@angular/core';
import { Notify2DocComponent } from './notify2-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { Notification2Module } from '../../../../kit/notification2/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    Notification2Module
  ],
  declarations: [Notify2DocComponent]
})
export class Notify2DocModule {
}
