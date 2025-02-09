import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  CreateFlowFromQrComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'channel-set-id/:channelSetId',
        component: CreateFlowFromQrComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RoutingModule {
}
