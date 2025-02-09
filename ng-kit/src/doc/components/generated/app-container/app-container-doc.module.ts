import { NgModule } from '@angular/core';

import { AppContainerDocComponent } from './app-container-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { AppContainerModule } from '../../../../kit/app-container/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    AppContainerModule
  ],
  declarations: [AppContainerDocComponent]
})
export class AppContainerDocModule {
}
