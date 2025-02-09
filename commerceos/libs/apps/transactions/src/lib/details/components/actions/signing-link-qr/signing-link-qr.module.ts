import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../../shared';

import { ActionSigningLinkQrComponent } from './signing-link-qr.component';
import { ActionSigningLinkQrStyleComponent } from './style/style.component';


const routes: Routes = [{
  path: '',
  component: ActionSigningLinkQrComponent,
}];

@NgModule({
  declarations: [
    ActionSigningLinkQrComponent,
    ActionSigningLinkQrStyleComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionSigningLinkQrModule { }
