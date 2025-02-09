import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DockerStoreComponent } from './docker-store.component';
import { DockerStoreItemComponent } from './docker-store-item.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DockerStoreComponent,
    DockerStoreItemComponent
  ],
  entryComponents: [ DockerStoreComponent ],
  exports: [ DockerStoreComponent ]
})
export class DockerStoreModule {}
