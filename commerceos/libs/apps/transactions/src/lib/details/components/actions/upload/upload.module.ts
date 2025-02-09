import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Routes, RouterModule } from '@angular/router';
import { WebcamModule } from 'ngx-webcam';

import {
  PebFormFieldInputModule,
  PebButtonModule,
  PebFormBackgroundModule,
  PebSelectModule,
} from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ImageCaptureComponent } from './image-capture/image-capture.component';
import { ActionUploadComponent } from './upload.component';


const routes: Routes = [{
  path: '',
  component: ActionUploadComponent,
}];

@NgModule({
  declarations: [
    ActionUploadComponent,
    ImageCaptureComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebSelectModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    WebcamModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionUploadModule { }
