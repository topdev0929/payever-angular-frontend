import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChannelsSettingsComponent } from './components/channels';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':widgetId',
        component: ChannelsSettingsComponent
      }
    ]
  }
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule]
})
export class FinexpRoutingModule {}
