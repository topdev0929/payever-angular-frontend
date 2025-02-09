import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import {
  RestoreFlowFromCodeComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':code',
        component: RestoreFlowFromCodeComponent,
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
