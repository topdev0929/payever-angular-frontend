import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeMessageChannelRootComponent } from './message-channel-root.component';

const routes: Routes = [
  {
    path: '',
    component: PeMessageChannelRootComponent,
  },
];

export const ChannelRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [ChannelRouterModuleForChild],
  declarations: [PeMessageChannelRootComponent],
  exports: [RouterModule],
})
export class PeChannelModule { }
