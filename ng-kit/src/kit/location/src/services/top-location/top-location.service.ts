import { Injectable } from '@angular/core';

@Injectable()
export class TopLocationService {

  set href(href: string) {
    window.top.location.href = href;
  }

  get href(): string {
    return window.top.location.href;
  }

}
