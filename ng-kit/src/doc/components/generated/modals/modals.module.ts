import { NgModule } from '@angular/core';

import { DocSharedModule } from '../../../modules/shared.module';

import { DocModalsRoutingModule  } from './modals-routing.module';

import { IconsProviderModule } from '../../../../kit/icons-provider';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { PeModalModule } from '../../../../kit';

import { ModalsComponent } from './components/modals.component';
import { ModalExampleSmallComponent } from './components/modal-example-small/modal-example-small.component';
import { ModalExampleConfirmComponent } from './components/modal-example-confirm/modal-example-confirm.component';
import { ModalExampleNotificationWarningComponent } from './components/modal-example-notification-warning/modal-example-notification-warning.component';
import { ModalExampleLargeComponent } from './components/modal-example-large/modal-example-large.component';
import { ModalExampleLargeDefaultHeaderComponent } from './components/modal-example-large-default-header/modal-example-large-default-header.component';
import { ModalExampleLargeBlueHeaderComponent } from './components/modal-example-large-blue-header/modal-example-large-blue-header.component';

@NgModule({
  imports: [
    DocSharedModule,
    DocModalsRoutingModule,
    IconsProviderModule,
    TabsModule,

    PeModalModule
  ],
  exports: [
    ModalsComponent
  ],
  declarations: [
    ModalsComponent,
    ModalExampleSmallComponent,
    ModalExampleConfirmComponent,
    ModalExampleNotificationWarningComponent,
    ModalExampleLargeComponent,
    ModalExampleLargeDefaultHeaderComponent,
    ModalExampleLargeBlueHeaderComponent
  ],
})
export class DocModalsModule {
}
