import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TopLocationService {
  isRedirecting = false;

  set href(href: string) {
    this.isRedirecting = true;
    window.top.location.href = href;
  }

  get href(): string {
    return window.top.location.href;
  }

}
