import { ModuleWithProviders, NgModule } from '@angular/core';

import { IconsPngUrlPipe } from './icons-png-url.pipe';
import { MediaUrlPipe } from './media-url.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
import { SafeStylePipe } from './safe-style.pipe';
import { MediaConfig } from './interfaces';
import { MEDIA_CONFIG } from './constants';
import { MediaService } from './media.service';

@NgModule({
  imports: [
  ],
  declarations: [
    IconsPngUrlPipe,
    MediaUrlPipe,
    SafeUrlPipe,
    SafeStylePipe
  ],
  exports: [
    IconsPngUrlPipe,
    MediaUrlPipe,
    SafeUrlPipe,
    SafeStylePipe
  ],
  providers: [
    MediaService,
  ],
})
export class MediaModule {

  public static forRoot(config: MediaConfig = {}): ModuleWithProviders<MediaModule> {
    return {
      ngModule: MediaModule,
      providers: [
        {
          provide: MEDIA_CONFIG,
          useValue: config
        },
      ]
    };
  }
}
