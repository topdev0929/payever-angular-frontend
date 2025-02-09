import { Injectable, Injector, Provider } from '@angular/core';
import { timer } from 'rxjs';

import { GoogleAutocompleteService, BaseGoogleAutocompleteService } from './google-autocomplete.service';

// @dynamic
@Injectable()
export class GoogleAutocompleteStubService extends BaseGoogleAutocompleteService {
  constructor(injector: Injector) {
    super(injector);
  }

  protected triggerLoading(): void {
    timer(10).subscribe(() => {
      this.onInitSubject.next(true);
    });
  }

  static provide(): Provider {
    return {
      provide: GoogleAutocompleteService,
      useFactory: (injector: Injector) => {
        return new GoogleAutocompleteStubService(injector);
      },
      deps: [Injector]
    };
  }
}
