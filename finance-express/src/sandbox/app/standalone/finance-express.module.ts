import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule } from '@pe/auth';

import { CoreModule } from '../core/core.module';
import { FinanceExpressRoutingModule } from './finance-express-routing.module';
import { PanelChannelsComponent } from './component/channels/channels.component';
import { HomeComponent } from './component/home/home.component';
import { FinexpWidgetComponent } from './component/finexp-widget/finexp-widget.component';
import { FinanceExpressComponent } from './component/finance-express/finance-express.component';
import { CheckoutModalModule } from '../../../modules/finexp-editor/src/shared/modal/checkout-modal.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxWebstorageModule.forRoot(),

    AuthModule,

    CoreModule,
    FinanceExpressRoutingModule,
    CheckoutModalModule
  ],
  declarations: [
    FinanceExpressComponent,
    PanelChannelsComponent,
    HomeComponent,
    FinexpWidgetComponent
  ],
  exports: [
    FinanceExpressComponent,
    PanelChannelsComponent,
    HomeComponent,
    FinexpWidgetComponent
  ],
  bootstrap: [FinanceExpressComponent]
})
export class FinanceExpressModule {
}
