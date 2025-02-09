import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


import { UtilsModule } from '@pe/checkout/utils';


import { ShowFlowQrComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    UtilsModule,
  ],
  declarations: [
    ShowFlowQrComponent,
  ],
  exports: [
    ShowFlowQrComponent,
  ],
})
export class FlowQRModule {
  resolveShowFlowQrComponent(): Type<ShowFlowQrComponent> {
    return ShowFlowQrComponent;
  }
}
