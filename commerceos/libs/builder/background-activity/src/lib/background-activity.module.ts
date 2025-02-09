import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { BackgroundActivityService } from './background-activity.service';
import { UploadInterceptorService } from './upload-interceptor.service';

@NgModule({
  imports: [CommonModule],
})
export class PebBackgroundActivityModule {

  static forChild(): ModuleWithProviders<PebBackgroundActivityModule> {

    return {
      ngModule: PebBackgroundActivityModule,
      providers: [
        BackgroundActivityService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UploadInterceptorService,
          multi: true,
          deps: [
            BackgroundActivityService,
          ],
        },
      ],
    };
  }
}
