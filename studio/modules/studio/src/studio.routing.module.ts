import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeStudioGridComponent } from './components/studio/grid/grid.component';
import { StudioGridGuard } from './guards/studio-grid.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: PeStudioGridComponent,
    canActivate: [StudioGridGuard]
  },
];
// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PeStudioRoutingModule {
}
