import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { FontLoaderService } from '@pe/builder/font-loader';
import { I18nModule } from '@pe/i18n';

import { ViewerIconsModule } from './icons/_icons.module';
import { PebViewerDeviceFrameComponent } from './preview-dialog/device-frame/device-frame.component';
import { PebViewerPreviewDialog } from './preview-dialog/preview.dialog';
import { PebViewer } from './viewer/viewer';

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    ViewerIconsModule,
    I18nModule,
  ],
  declarations: [
    PebViewer,
    PebViewerPreviewDialog,
    PebViewerDeviceFrameComponent,
  ],
  exports: [
    PebViewer,
    PebViewerPreviewDialog,
  ],
  providers: [
    FontLoaderService,
  ],
})
export class PebViewerModule {
  static forRoot(): ModuleWithProviders<PebViewerModule> {
    return PebViewerModule.withConfig({});
  }

  static withConfig(config: any): ModuleWithProviders<PebViewerModule> {
    return {
      ngModule: PebViewerModule,
      providers: [
        FontLoaderService,
      ],
    };
  }
}
