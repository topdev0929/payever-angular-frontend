import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAffiliatesProgramsComponent } from './programs.component';

const routes: Routes = [
  {
    path: '',
    component: PeAffiliatesProgramsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeAffiliatesProgramsRoutingModule { }
