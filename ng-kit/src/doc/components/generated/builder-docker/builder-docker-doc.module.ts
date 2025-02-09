import { NgModule } from '@angular/core';
import { BuilderDockerDocComponent } from './builder-docker-doc.component';
import { BuilderDockerItemDocComponent } from './builder-docker-item-doc.component';
import { BuilderDockerServiceDocComponent } from './builder-docker-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { BuilderDockerModule } from '../../../../kit/builder-docker/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    BuilderDockerModule
  ],
  declarations: [
    BuilderDockerDocComponent,
    BuilderDockerItemDocComponent,
    BuilderDockerServiceDocComponent
  ]
})
export class BuilderDockerDocModule {

}
