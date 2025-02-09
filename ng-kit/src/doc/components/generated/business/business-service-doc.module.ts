import { NgModule } from '@angular/core';
import { BusinessServiceDocComponent } from './business-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [BusinessServiceDocComponent]
})
export class BusinessServiceDocModule {

}
