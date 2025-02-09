import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { BaseModule, CosMessageBus } from '@pe/base';
import { MessageBus } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { BusinessGuard, BusinessListGuard, DefaultBusinessGuard } from '@pe/shared/business';
import { BusinessWallpaperGuard } from '@pe/wallpaper';

import { LanguageGuard } from '../../guards/language.guard';

import { AppLazyComponent } from './app-lazy.component';
import { AppRoutingModule } from './app-routing.module';
import { WindowEventsService } from '@pe/window';

@NgModule({
    declarations: [AppLazyComponent],
    imports: [
      CommonModule,
      AppRoutingModule,
      I18nModule.forRoot({ useStorageForLocale: true }),
      BaseModule,
      MatAutocompleteModule,
      MatDatepickerModule,
    ],
    providers: [
      BusinessWallpaperGuard,
      BusinessListGuard,
      BusinessGuard,
      PeOverlayWidgetService,
      DefaultBusinessGuard,
      LanguageGuard,
      WindowEventsService,
      {
        provide: MessageBus,
        useClass: CosMessageBus,
      },
    ],
})
export class AppLazyModule { }
