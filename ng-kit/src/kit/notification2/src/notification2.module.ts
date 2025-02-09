import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Notification2WrapperComponent} from './notification2-wrapper/notification2-wrapper.component';
import {Notification2Component} from './notification2/notification2.component';
import {Notification2Service} from './notification2.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    Notification2WrapperComponent,
    Notification2Component
  ],
  entryComponents: [
    Notification2WrapperComponent,
    Notification2Component
  ],
  exports: [Notification2Component],
  providers: [Notification2Service]
})
export class Notification2Module {}
