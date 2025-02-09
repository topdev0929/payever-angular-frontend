import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MicroModule } from '@pe/common';
import { PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionDownloadSlipComponent } from './download-slip.component';

const routes: Routes = [{
  path: '',
  component: ActionDownloadSlipComponent,
}];

@NgModule({
  declarations: [
    ActionDownloadSlipComponent,
  ],
  imports: [
    SharedModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
    MicroModule,
  ],
})
export class ActionDownloadSlipModule { }
