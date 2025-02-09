import { NgModule } from '@angular/core';
import { LocalStorageServiceDocComponent } from './local-storage-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [LocalStorageServiceDocComponent]
})
export class LocalStorageDocModule {
}
