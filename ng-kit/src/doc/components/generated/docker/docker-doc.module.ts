import { NgModule } from '@angular/core';
import { DockerDocComponent } from './docker-doc.component';
import { DockerExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DockerModule } from '../../../../kit/docker';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DockerModule
  ],
  declarations: [
    DockerDocComponent,
    DockerExampleDocComponent
  ]
})
export class DockerDocModule {
}
