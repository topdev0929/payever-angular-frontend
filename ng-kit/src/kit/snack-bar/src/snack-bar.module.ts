import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackBarContentComponent } from './components';
import { SnackBarService } from './services';

const sharedComponents: any[] = [
  SnackBarContentComponent
];

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  declarations: [...sharedComponents],
  exports: [...sharedComponents],
  entryComponents: [...sharedComponents],
  providers: [
    SnackBarService
  ]
})
export class SnackBarModule {}
