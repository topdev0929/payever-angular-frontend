import { NgModule } from '@angular/core';

import { BackgroundService } from './services';
import { MediaUrlPipe } from '../../media/src';

@NgModule({
  providers: [
    BackgroundService,
    MediaUrlPipe
  ]
})
export class WallpaperModule {}
