import { NgModule } from '@angular/core';

import { CommonModule } from '../../common';
import { ProfileService } from './profile.service';

@NgModule({
  imports: [CommonModule],
  providers: [ProfileService]
})
export class ProfileModule {}
