import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { MainSendToDeviceComponent } from './send-to-device.component';


@NgModule({
  declarations: [
    MainSendToDeviceComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainSendToDeviceComponent,
  ],
})
export class SendToDeviceModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<MainSendToDeviceComponent> {
    return MainSendToDeviceComponent;
  }
}
