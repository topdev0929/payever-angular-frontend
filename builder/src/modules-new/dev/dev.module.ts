import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconsProviderModule } from '@pe/ng-kit/modules/icons-provider';
import { DevHelpersComponent } from './dev-helpers.component';

@NgModule({
  imports: [CommonModule, FormsModule, ...[process.env.NODE_ENV === 'production' ? [] : [IconsProviderModule]]],
  declarations: [DevHelpersComponent],
  exports: [DevHelpersComponent],
})
export class DevModule {}
