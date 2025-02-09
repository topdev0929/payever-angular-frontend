import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuidesComponent } from './guides.component';
import { GuideViewerComponent } from '../modules/guide-viewer';

const appRoutes: Routes = [
  {
    path: 'guides',
    component: GuidesComponent,
    children: [
      {
        path: ':id',
        component: GuideViewerComponent
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})
export class GuidesRoutingModule {
}
