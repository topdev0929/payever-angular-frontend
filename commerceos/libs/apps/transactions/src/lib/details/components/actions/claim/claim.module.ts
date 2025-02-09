import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Routes, RouterModule } from '@angular/router';

import { PebButtonModule, PebButtonToggleModule, PebFormBackgroundModule, PebFormFieldInputModule, PebSelectModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionClaimComponent } from './claim.component';
import { ClaimPickFileComponent } from './pick-file/pick-file.component';
import { ClaimService, FileService } from './services';



const routes: Routes = [{
  path: '',
  component: ActionClaimComponent,
}];

@NgModule({
  declarations: [
    ActionClaimComponent,
    ClaimPickFileComponent,
  ],
  imports: [
    PebFormFieldInputModule,
    PebButtonModule,
    PebSelectModule,
    PebFormBackgroundModule,
    PebButtonToggleModule,
    SharedModule,
    MatIconModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    FileService,
    ClaimService,
  ],
})
export class ActionClaimModule { }
