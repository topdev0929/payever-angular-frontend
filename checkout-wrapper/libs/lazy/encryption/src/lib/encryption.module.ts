import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EncryptionService } from './services';

@NgModule({
  imports: [CommonModule],
  providers: [EncryptionService],
})
export class EncryptionModule {}
