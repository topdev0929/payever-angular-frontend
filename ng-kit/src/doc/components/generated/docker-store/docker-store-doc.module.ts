import { NgModule } from '@angular/core';
import { DockerStoreItemDocComponent } from './docker-store-item-doc.component';
import { DockerStoreDocComponent } from './docker-store-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DockerStoreModule } from '../../../../kit/docker-store/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DockerStoreModule
  ],
  declarations: [
    DockerStoreItemDocComponent,
    DockerStoreDocComponent
  ]
})
export class DockerStoreDocModule {
}
