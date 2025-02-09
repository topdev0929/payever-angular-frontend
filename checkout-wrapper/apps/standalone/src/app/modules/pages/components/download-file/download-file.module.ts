import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UtilsModule } from '@pe/checkout/utils';


import { DownloadFileComponent } from './download-file.component';

const routes: Routes = [
  {
    path: '',
    component: DownloadFileComponent,
  },
];

@NgModule({
  declarations: [
    DownloadFileComponent,
  ],
  imports: [
    RouterModule.forChild(routes),

    UtilsModule,
  ],
  exports: [
    DownloadFileComponent,
  ],
})
export class DownloadFileModule {}
