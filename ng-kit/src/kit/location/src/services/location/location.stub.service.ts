import { Injectable, Provider } from '@angular/core';

import { LocationService } from './location.service';

@Injectable()
export class LocationStubService {
  // Defaults from real window
  href: string = window.location.href;
  hash: string = window.location.hash;
  host: string = window.location.host;
  hostname: string = window.location.hostname;
  origin: string = window.location.origin;
  pathname: string = window.location.pathname;
  port: string = window.location.port;
  protocol: string = window.location.protocol;
  search: string = window.location.search;

  // Test params
  assigned: string;
  reloaded: boolean = false;
  replaced: string;
  forcedReload: boolean;

  assign(url: string): void {
    this.assigned = url;
  }

  reload(forcedReload?: boolean): void {
    this.reloaded = true;
    this.forcedReload = forcedReload;
  }

  replace(url: string): void {
    this.replaced = url;
  }

  toString(): string {
    return this.href;
  }

  static provide(): Provider {
    return {
      provide: LocationService,
      useClass: LocationStubService
    };
  }
}
