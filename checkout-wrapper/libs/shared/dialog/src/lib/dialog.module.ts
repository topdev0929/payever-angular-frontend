import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { DialogComponent, DialogContentComponent, DialogActionsComponent } from './components';
import {
  DIALOG_BUTTON_PRESETS,
  DIALOG_BUTTON_PRESETS_TOKEN,
  DIALOG_CONFIG_PRESETS,
  DIALOG_CONFIG_PRESETS_TOKEN,
} from './constants';
import { DialogCloseDirective } from './directives';
import { DialogService } from './services';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  declarations: [
    DialogComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogCloseDirective,
  ],
  exports: [
    DialogComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogCloseDirective,
  ],
  providers: [
    DialogService,
    {
      provide: DIALOG_BUTTON_PRESETS_TOKEN,
      useValue: DIALOG_BUTTON_PRESETS,
    },
    {
      provide: DIALOG_CONFIG_PRESETS_TOKEN,
      useValue: DIALOG_CONFIG_PRESETS,
    },
  ],
})
export class DialogModule {}
