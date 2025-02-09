import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuilderDockerComponent } from './builder-docker.component';
import { BuilderDockerItemComponent } from './builder-docker-item.component';
import { BuilderDockerService } from './builder-docker.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BuilderDockerComponent,
    BuilderDockerItemComponent
  ],
  providers: [ BuilderDockerService ],
  entryComponents: [ BuilderDockerComponent ],
  exports: [ BuilderDockerComponent ]
})
export class BuilderDockerModule {}
