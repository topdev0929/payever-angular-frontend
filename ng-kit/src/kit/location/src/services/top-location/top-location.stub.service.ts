import { Injectable, Provider } from '@angular/core';

import { TopLocationService } from './top-location.service';

@Injectable()
export class TopLocationStubService {
  // Defaults from real window
  href: string = window.top.location.href;

  static provide(): Provider {
    return {
      provide: TopLocationService,
      useClass: TopLocationStubService
    };
  }
}
