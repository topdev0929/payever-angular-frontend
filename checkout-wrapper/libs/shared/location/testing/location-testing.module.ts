import { NgModule } from '@angular/core';

import { LocationStubService, TopLocationStubService } from '../src/services';

@NgModule({
  providers: [
    LocationStubService.provide(),
    TopLocationStubService.provide(),
  ],
})
export class LocationTestingModule {}
