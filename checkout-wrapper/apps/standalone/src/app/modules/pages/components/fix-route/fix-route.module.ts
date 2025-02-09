import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FixRouteComponent } from './fix-route.component';

const routes: Routes = [
  {
    path: '',
    component: FixRouteComponent,
  },
];

@NgModule({
  declarations: [
    FixRouteComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    FixRouteComponent,
  ],
})
export class FixRouteModule {}
