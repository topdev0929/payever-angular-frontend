import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { I18nModule } from '../../i18n';
import { DIALOG_BUTTON_PRESETS, DIALOG_BUTTON_PRESETS_TOKEN, DIALOG_CONFIG_PRESETS, DIALOG_CONFIG_PRESETS_TOKEN } from './constants';
import { DialogComponent, DialogContentComponent, DialogActionsComponent } from './components';
import { DialogCloseDirective } from './directives';
import { DialogService } from './services';

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    DialogComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogCloseDirective
  ],
  entryComponents: [
    DialogComponent
  ],
  exports: [
    DialogComponent,
    DialogContentComponent,
    DialogActionsComponent,
    DialogCloseDirective
  ],
  providers: [
    DialogService,
    {
      provide: DIALOG_BUTTON_PRESETS_TOKEN,
      useValue: DIALOG_BUTTON_PRESETS
    },
    {
      provide: DIALOG_CONFIG_PRESETS_TOKEN,
      useValue: DIALOG_CONFIG_PRESETS
    }
  ]
})
export class DialogModule {}
