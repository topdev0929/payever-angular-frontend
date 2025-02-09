import { NgModule } from '@angular/core';
import { DockerPosDocComponent } from './docker-pos-doc.component';
import { DockerPosItemDocComponent } from './docker-pos-item-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DockerPosModule } from '../../../../kit/docker-pos/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DockerPosModule
  ],
  declarations: [
    DockerPosDocComponent,
    DockerPosItemDocComponent
  ]
})
export class DockerPosDocModule {
}
