import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  WidgetViewComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':widgetId',
        component: WidgetViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RoutingModule {
}
