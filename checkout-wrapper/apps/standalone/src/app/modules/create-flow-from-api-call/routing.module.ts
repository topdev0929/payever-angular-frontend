import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  CreateFlowFromApiCallComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':apiCallId',
        component: CreateFlowFromApiCallComponent,
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
