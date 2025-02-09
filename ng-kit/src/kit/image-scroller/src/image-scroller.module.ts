import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MediaModule } from '../../media';
import { I18nModule } from '../../i18n/src';
import { ImagePreviewComponent, ImageScrollerComponent } from './components';
import { ProgressSpinnerModule } from '../../spinner/src';

@NgModule({
  imports: [
    CommonModule,
    MediaModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ProgressSpinnerModule,
    I18nModule.forChild()
  ],
  declarations: [
    ImageScrollerComponent,
    ImagePreviewComponent
  ],
  exports: [
    ImageScrollerComponent,
    ImagePreviewComponent
  ]
})
export class ImageScrollerModule {
}
