import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeHeaderComponent } from './header.component';


export const routes: Routes = [
  {
    path: '',
    component: PeHeaderComponent,
  },
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class PeHeaderRoutingModule {
}
