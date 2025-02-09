import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeContactsListComponent } from './routes/contacts-list/contacts-list.component';
import { PeContactsLayoutComponent } from './routes/root/contacts-layout.component';

const routes: Routes = [
  {
    path: '',
    component: PeContactsLayoutComponent,
    children: [
      {
        path: '',
        component: PeContactsListComponent,
      },
    ]
  }
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const ROUTER_MODULE_FOR_CHILD: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [ROUTER_MODULE_FOR_CHILD],
  exports: [RouterModule]
})
export class ContactsRoutingModule {
}
