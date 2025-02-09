import { NgModule } from '@angular/core';

import { LocationService, TopLocationService } from './services';

@NgModule({
  providers: [
    LocationService,
    TopLocationService
  ]
})
export class LocationModule {}
