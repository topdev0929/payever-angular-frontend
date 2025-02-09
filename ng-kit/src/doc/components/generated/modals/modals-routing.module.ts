import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IconsProviderModule } from '../../../../kit/icons-provider';

import { ModalExampleSmallComponent } from './components/modal-example-small/modal-example-small.component';
import { ModalExampleConfirmComponent } from './components/modal-example-confirm/modal-example-confirm.component';
import { ModalExampleNotificationWarningComponent } from './components/modal-example-notification-warning/modal-example-notification-warning.component';
import { ModalExampleLargeComponent } from './components/modal-example-large/modal-example-large.component';
import { ModalExampleLargeDefaultHeaderComponent } from './components/modal-example-large-default-header/modal-example-large-default-header.component';
import { ModalExampleLargeBlueHeaderComponent } from './components/modal-example-large-blue-header/modal-example-large-blue-header.component';

const routes: Routes = [
  {
    path: 'modals/modal-examples/small',
    component: ModalExampleSmallComponent
  },
  {
    path: 'modals/modal-examples/confirm',
    component: ModalExampleConfirmComponent
  },
  {
    path: 'modals/modal-examples/notification-warning',
    component: ModalExampleNotificationWarningComponent
  },
  {
    path: 'modals/modal-examples/large',
    component: ModalExampleLargeComponent
  },
  {
    path: 'modals/modal-examples/large-default-header',
    component: ModalExampleLargeDefaultHeaderComponent
  },
  {
    path: 'modals/modal-examples/large-blue-header',
    component: ModalExampleLargeBlueHeaderComponent
  },
];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
      IconsProviderModule
  ],
  exports: [RouterModule]
})
export class DocModalsRoutingModule {}
