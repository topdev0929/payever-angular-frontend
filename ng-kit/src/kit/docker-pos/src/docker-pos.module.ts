import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DockerPosComponent } from './docker-pos.component';
import { DockerPosItemComponent } from './docker-pos-item.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DockerPosComponent,
    DockerPosItemComponent,
  ],
  entryComponents: [ DockerPosComponent ],
  exports: [ DockerPosComponent ]
})
export class DockerPosModule {}
