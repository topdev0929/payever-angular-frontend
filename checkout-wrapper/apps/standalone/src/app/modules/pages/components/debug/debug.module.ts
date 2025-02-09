import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UtilsModule } from '@pe/checkout/utils';

import { DebugComponent } from './debug.component';

const routes: Routes = [
  {
    path: '',
    component: DebugComponent,
  },
];

@NgModule({
  declarations: [
    DebugComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    UtilsModule,
  ],
  exports: [
    DebugComponent,
  ],
})
export class DebugModule {}
