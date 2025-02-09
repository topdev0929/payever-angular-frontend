import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MediaModule } from '../../media';
import { SnackBarModule } from '../../snack-bar';
import { FormCoreModule } from '../../form-core/form-core.module';
import { ImagePickerComponent } from './components';
import { ImageUploadService } from './services';

const shared: any = [
  ImagePickerComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MediaModule,
    SnackBarModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared
  ],
  providers: [
    ImageUploadService
  ]
})
export class FormComponentsImagePickerModule {}
