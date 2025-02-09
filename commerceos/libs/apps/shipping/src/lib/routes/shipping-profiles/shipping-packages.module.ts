import { NgModule } from '@angular/core';
import { ApolloModule } from 'apollo-angular';

import { ApolloConfigModule } from '../../apollo.module';
import { ProfileResolver } from '../../resolver/profile.resolver';
import { SharedModule } from '../../shared';

import { ProductsDialogService } from './browse-products/products/products-dialog.service';
import { ProductsApiService } from './browse-products/services/api.service';
import { ProductsListService } from './browse-products/services/products-list.service';
import { ProfileWrapComponent } from './profiles-dialog/profile-wrap.component';
import { PebShippingProfileFormComponent } from './profiles-dialog/profiles-dialog.component';
import { ShippingProfilesRoutingModule } from './shipping-profiles-routing.module';
import { PebShippingProfilesComponent } from './shipping-profiles.component';

@NgModule({
  declarations: [
    ProfileWrapComponent,
    PebShippingProfilesComponent,
    PebShippingProfileFormComponent,
  ],
  imports: [
    SharedModule,
    ShippingProfilesRoutingModule,
    ApolloModule,
    ApolloConfigModule,
  ],
  providers: [
    ProductsListService,
    ProductsApiService,
    ProductsDialogService,
    ProfileResolver,
  ],
})
export class ShippingPackagesModule {
}
