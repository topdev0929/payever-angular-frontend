import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, Routes } from '@angular/router';

import { FlowGeneratorComponent } from './flow-generator.component';
import { FlowGeneratorGuard } from './flow-generator.guard';

const routes: Routes = [
  {
    path: '',
    component: FlowGeneratorComponent,
    canActivate: [FlowGeneratorGuard],
  },
];

@NgModule({
  declarations: [
    FlowGeneratorComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  exports: [
    FlowGeneratorComponent,
  ],
  providers: [
    FlowGeneratorGuard,
  ],
})
export class FlowGeneratorModule {}
