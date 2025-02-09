import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeDataGridModule} from '@pe/data-grid';
import { FormCoreModule, ThirdPartyFormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';

import { PebAdsRouteModule } from './ads.routing';
import { PeAdsApi } from './api/abstract.ads.api';
import { PeActualAdsApi } from './api/actual.ads.api';
import { PebAdsComponent } from './routes/_root/ads-root.component';
import { PebCampaignsComponent } from './routes/campaigns/campaigns.component';

export const I18NModuleForRoot = I18nModule.forRoot();

@NgModule({
  imports: [
    PebAdsRouteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    MatExpansionModule,
    NgScrollbarModule,
    ClipboardModule,
    PeDataGridModule,
    ThirdPartyFormModule,
    FormCoreModule,
    I18NModuleForRoot,
  ],
  declarations: [
    PebAdsComponent,
    PebCampaignsComponent,
  ],
  providers: [
    {
      provide: PeAdsApi,
      useClass: PeActualAdsApi,
    }
  ],
})
export class PebAdsModule {}
