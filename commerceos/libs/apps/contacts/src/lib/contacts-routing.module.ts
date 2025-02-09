import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContactsResolver } from './resolver/contacts.resolver';
import {
  PeContactsLayoutComponent,
  PeContactsListComponent,
} from './routes';


const routes: Routes = [
  {
    path: '',
    component: PeContactsLayoutComponent,
    children: [
      {
        path: '',
        component: PeContactsListComponent,
      },
      {
        path: ':contactId/details',
        component: PeContactsListComponent,
        resolve: {
          contact: ContactsResolver,
        },
        data: {
          isDetailsView: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsRoutingModule { }
