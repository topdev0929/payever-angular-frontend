import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ModalComponent } from './components';
import { RouterModalService } from './router-modal.service';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [ModalComponent],
  exports: [ModalComponent],
  providers: [RouterModalService]
})
export class RouterModalModule {
}
