import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class AppRegistryService {
  private cacheRegistry: {[url: string]: ReplaySubject<object>} = {};

  constructor(private httpClient: HttpClient) {
  }

  getRegistry(url: string): ReplaySubject<object> {
    if (!this.cacheRegistry[url]) {
      this.cacheRegistry[url] = new ReplaySubject<object>(1);

      this.httpClient.get(url).subscribe((result: object) => {
        this.cacheRegistry[url].next(result);
        this.cacheRegistry[url].complete();
      });
    }

    return this.cacheRegistry[url];
  }
}
