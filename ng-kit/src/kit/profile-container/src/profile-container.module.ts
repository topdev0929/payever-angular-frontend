import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileContainerComponent } from './profile-container.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ProfileContainerComponent
  ],
  entryComponents: [ ProfileContainerComponent ],
  exports: [ ProfileContainerComponent ]
})
export class ProfileContainerModule {}
