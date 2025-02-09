import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebDeviceService } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { PebFormBackgroundModule, PebSelectModule } from '@pe/ui';

import { ApiService } from '../services/api.service';
import { SettingsService } from '../services/settings.service';

import { ActionLayoutComponent, ActionSubmitComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    PebFormBackgroundModule,
    PebSelectModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ActionLayoutComponent,
    ActionSubmitComponent,
  ],
  exports: [
    CommonModule,
    I18nModule,
    PebFormBackgroundModule,
    PebSelectModule,
    FormsModule,
    ReactiveFormsModule,
    ActionLayoutComponent,
  ],
  providers: [
    ApiService,
    SettingsService,
    PebDeviceService,
  ],
})

export class SharedModule {}
