import { CommonModule } from '@angular/common';
import { NgModule, InjectionToken } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeDataGridModule } from '@pe/data-grid';

import { PebShopRouteModule } from './mail.routing';
import { PebMailSharedModule } from './mail.shared';
import { PebCampaignGridComponent } from './routes/grid/campaign-grid.component';
import { PebShopSettingsComponent } from './routes/settings/campaign-settings.component';
import { PebShopComponent } from './routes/_root/mail-root.component';
import { PebShopGeneralSettingsComponent } from './routes/settings/general/campaign-general-settings.component';
import { MailResolver } from './resolvers/mail.resolver';
import { PebShopEditComponent } from './routes/edit/campaign-edit.component';
import { PebShopDashboardComponent } from './routes/dashboard/campaign-dashboard.component';
import { PebMailIconFilterComponent } from './misc/icons/filter.icon';
import { PebMailIconSearchComponent } from './misc/icons/search.icon';
import { PebMailIconSortByComponent } from './misc/icons/sort-by.icon';
import { PebMailIconCampaignComponent } from './misc/icons/campaign.icon';
import { PebMailIconCheckComponent } from './misc/icons/check.icon';
import { PebMailIconDraftComponent } from './misc/icons/draft.icon';
import { PebMailIconCloseComponent } from './misc/icons/close.icon';
import { PebMailIconBigCampaignComponent } from './misc/icons/big-campaign.icon';


// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const PebViewerModuleForRoot: any = PebViewerModule.forRoot();

const icons = [
  PebMailIconFilterComponent,
  PebMailIconSearchComponent,
  PebMailIconSortByComponent,
  PebMailIconCampaignComponent,
  PebMailIconCheckComponent,
  PebMailIconDraftComponent,
  PebMailIconCloseComponent,
  PebMailIconBigCampaignComponent,
];

@NgModule({
  imports: [
    PebShopRouteModule,
    PebMailSharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    PebViewerModuleForRoot,
    NgScrollbarModule,
    PeDataGridModule,
  ],
  declarations: [
    ...icons,
    PebShopComponent,
    PebCampaignGridComponent,
    PebShopEditComponent,
    PebShopSettingsComponent,
    PebShopGeneralSettingsComponent,
    PebShopDashboardComponent,
  ],
  providers: [
    // ShopResolver,
  ],
})
export class PebMailModule {}
