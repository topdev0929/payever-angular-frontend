import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from '../../dialog';

import {
  TooltipDialogComponent,
  TooltipIconComponent
} from './components';

const shared: any = [
  TooltipDialogComponent,
  TooltipIconComponent
];

@NgModule({
  imports: [
    CommonModule,
    DialogModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared
  ]
})
export class TooltipIconModule {}
