// import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { WindowModule } from '@pe/ng-kit/modules/window';

import { BusinessDataEffects, FiltersEffects, reducer, TransactionsEffects } from './state-management';

import { DateFormatPipe } from './pipes';
import { ApiService, HeaderService, SettingsService, StatusUpdaterService, IconsService } from './services';

@NgModule({
  imports: [
    // HttpClientModule,
    WindowModule
  ],
  declarations: [DateFormatPipe],
  exports: [DateFormatPipe]
})
export class SharedModule {

  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        ApiService,
        HeaderService,
        DateFormatPipe,
        SettingsService,
        StatusUpdaterService,
        IconsService
      ]
    };
  }

}
