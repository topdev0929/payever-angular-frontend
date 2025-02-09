import { Inject, Injectable, Injector } from '@angular/core';

import { BaseGoogleAutocompleteService } from './base-google-autocomplete.service';

@Injectable()
export class GoogleAutocompleteService extends BaseGoogleAutocompleteService {
  constructor(
    injector: Injector,
    @Inject('POS_GOOGLE_MAPS_API_KEY') googleMapsApiKey: string,
  ) {
    super(injector, googleMapsApiKey);
  }
}
