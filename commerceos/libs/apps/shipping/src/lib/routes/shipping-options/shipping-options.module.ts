import { NgModule } from '@angular/core';
import { ApolloModule } from 'apollo-angular';

import { ApolloConfigModule } from '../../apollo.module';
import { ZoneResolver } from '../../resolver/zone.resolver';
import { SharedModule } from '../../shared';



import { PebShippingEditOptionsComponent } from './edit-options-modal/edit-options.component';
import { ShippingOptionsRoutingModule } from './shipping-options-routing.module';
import { PebShippingOptionsComponent } from './shipping-options.component';

@NgModule({
  declarations: [
    PebShippingOptionsComponent,
    PebShippingEditOptionsComponent,
  ],
  imports: [
    SharedModule,
    ShippingOptionsRoutingModule,
    ApolloModule,
    ApolloConfigModule,
  ],
  providers: [
    ZoneResolver,
  ],
})
export class ShippingOptionsModule {}
