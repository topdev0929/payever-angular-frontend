import { NgModule } from '@angular/core';
import { SessionStorageServiceDocComponent } from './session-storage-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SessionStorageModule } from '../../../../kit/session-storage';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SessionStorageModule
  ],
  declarations: [SessionStorageServiceDocComponent]
})
export class SessionStorageServiceDocModule {
}
