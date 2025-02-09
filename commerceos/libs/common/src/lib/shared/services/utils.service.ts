import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PeUtilsService {
  debounce(func: (...args: any) => any, delay = 100) {
    let timer: number;

    return (event: any) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = window.setTimeout(func, delay, event);
    };
  }
}
