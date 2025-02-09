import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SwiperModule } from '../../swiper';

import { DockerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatBadgeModule,
    MatToolbarModule,
    MatListModule,
    SwiperModule
  ],
  declarations: [
    DockerComponent
  ],
  exports: [
    DockerComponent
  ],
  entryComponents: [
    DockerComponent
  ]
})
export class DockerModule {}
