import { NgModule } from '@angular/core';
import { WindowServiceDocComponent } from './window-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [WindowServiceDocComponent]
})
export class WindowServiceDocModule {
}
