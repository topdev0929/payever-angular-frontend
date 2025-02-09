import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';

import { NavigationService } from '@pe/common';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebButtonModule } from '@pe/ui';

import { PeShopBuilderEditComponent } from './builder-edit/builder-edit.component';
import { PebShopBuilderInsertComponent } from './builder-insert/builder-insert.component';
import { PeShopBuilderIntegrationComponent } from './builder-integration/builder-integration.component';
import { PeShopBuilderThemeComponent } from './builder-theme/builder-theme.component';
import { PebShopBuilderViewComponent } from './builder-view';
import { PeHeaderRoutingModule } from './header-routing.module';
import { PeHeaderComponent } from './header.component';
import { PeHeaderService } from './header.service';

@NgModule({
  imports: [CommonModule, PeHeaderRoutingModule, PePlatformHeaderModule, PebButtonModule],
  declarations: [
    PeHeaderComponent,
    PeShopBuilderEditComponent,
    PeShopBuilderThemeComponent,
    PebShopBuilderInsertComponent,
    PebShopBuilderViewComponent,
    PeShopBuilderIntegrationComponent,
  ],
  providers: [
    NavigationService,
    PeHeaderService,
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA],
      },
    },
  ],
})
export class PeBuilderAppHeaderModule {}
