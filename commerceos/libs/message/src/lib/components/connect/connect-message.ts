import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebButtonModule } from "@pe/ui";

import { PeMessageConnectRootComponent } from './message-connect-root';

const routes: Routes = [
  {
    path: '',
    component: PeMessageConnectRootComponent,
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [
    RouterModuleForChild,
    PebButtonModule,
  ],
  declarations: [PeMessageConnectRootComponent],
  exports: [RouterModule],
})
export class PeConnectMessageModule { }
