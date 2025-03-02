import { Directive, OnDestroy } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { PlatformEventInterface } from '../misc/interfaces/platform-event.interface';


@Directive()
export abstract class PlatformAbstractService implements OnDestroy {

  protected abstract readonly eventName: string;

  private destroy$ = new Subject<void>();
  private cachedObserve$: Observable<PlatformEventInterface> = null;

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  get observe$(): Observable<PlatformEventInterface> {
    if (!this.cachedObserve$) {
      const messageRegex = /^pe:os:(.*?):(.*?)(?::(.*))?$/;

      this.cachedObserve$ = fromEvent(window, this.eventName).pipe(
        takeUntil(this.destroy$),
        filter((event: CustomEvent) => typeof event.detail === 'string' && messageRegex.test(event.detail)),
        map((event: CustomEvent): PlatformEventInterface => {
          const match: string[] = messageRegex.exec(event.detail);
          const target: string = match[1];
          const action: string = match[2];
          const dataString: string = match[3];
          let data: any;

          if (dataString) {
            try {
              data = JSON.parse(dataString);
            } catch (e) {
              data = dataString;
            }
          }

          return { target, action, data };
        }),
      );
    }

    return this.cachedObserve$;
  }

  dispatchEvent(event: PlatformEventInterface, origin: string = window.location.origin): void {
    let messageString = `pe:os:${event.target}:${event.action}`;

    if (event.data) {
      if (typeof event.data === 'string') {
        messageString += `:${event.data}`;
      } else {
        messageString += `:${JSON.stringify(event.data)}`;
      }
    }

    const backgroundEvent: Event = new CustomEvent(this.eventName, {
      detail: messageString,
    });
    window.dispatchEvent(backgroundEvent);
  }

}
