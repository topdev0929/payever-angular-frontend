import { NgModule } from '@angular/core';
import { GuidesComponent } from './guides.component';
import { RouterModule } from '@angular/router';
import { GuidesRoutingModule } from './guides-routing.module';

@NgModule({
  imports: [
    RouterModule,
    GuidesRoutingModule
  ],
  declarations: [
    GuidesComponent
  ],
  exports: [
    GuidesComponent,
    GuidesRoutingModule
  ]
})
export class GuidesModule {}
