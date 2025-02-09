import { NgModule } from '@angular/core';
import { RouterModalDocComponent } from './modal-doc.component';
import { RouterModalServiceDocComponent } from './router-modal-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { RouterModalModule } from '../../../../kit/modal/router-modal';

@NgModule({
  imports: [
    DocComponentSharedModule,
    RouterModalModule
  ],
  declarations: [
    RouterModalDocComponent,
    RouterModalServiceDocComponent
  ]
})
export class RouterModalDocModule {
}
