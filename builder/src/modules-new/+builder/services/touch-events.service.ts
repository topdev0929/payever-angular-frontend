import { Injectable } from '@angular/core';
import { fromEvent as observableFromEvent, merge, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AbstractService } from '@pe/ng-kit/modules/common';

declare var DocumentTouch: any;

export type TouchEventName = 'mouseup' | 'mousedown' | 'mousemove';

export enum TouchEventType {
  Mouse = 'mouse',
  Touch = 'touch',
  Pointer = 'pointer',
  Microsoft = 'microsoft',
}

export interface MouseCoordinatesInterface {
  pageX: number;
  pageY: number;
  target: HTMLElement;
}

interface EventNames {
  mouseup: string;
  mousedown: string;
  mousemove: string;
}

const MOUSE_EVENTS: EventNames = {
  mouseup: 'mouseup',
  mousedown: 'mousedown',
  mousemove: 'mousemove',
};
const TOUCH_EVENTS: EventNames = {
  mouseup: 'touchend',
  mousedown: 'touchstart',
  mousemove: 'touchmove',
};
const POINTER_EVENTS: EventNames = {
  mouseup: 'pointerup',
  mousedown: 'pointerdown',
  mousemove: 'pointermove',
};
const MICROSOFT_EVENTS: EventNames = {
  mouseup: 'MSPointerUp',
  mousedown: 'MSPointerDown',
  mousemove: 'MSPointerMove',
};

@Injectable({
  providedIn: 'root',
})
export class TouchEventsNewService extends AbstractService {

  eventType: TouchEventType;

  private eventNames: EventNames;
  private mobileEmulator: boolean;

  constructor() {
    super();

    const { PointerEvent, MSPointerEvent } = window as any;

    if (PointerEvent || window.navigator.pointerEnabled) {
      this.eventNames = POINTER_EVENTS;
      this.eventType = TouchEventType.Pointer;
    } else if (MSPointerEvent || window.navigator.msPointerEnabled) {
      this.eventNames = MICROSOFT_EVENTS;
      this.eventType = TouchEventType.Microsoft;
    } else if ('ontouchstart' in window) {
      this.eventNames = TOUCH_EVENTS;
      this.eventType = TouchEventType.Touch;
    } else {
      this.eventNames = MOUSE_EVENTS;
      this.eventType = TouchEventType.Mouse;
    }

    observableFromEvent(window, 'orientationchange')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event: Event) => {
        timer(0).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.mobileEmulator = (event.target && (event.target as any).devicePixelRatio > 1)
            || window.navigator.userAgent.indexOf('Mobile') !== -1;
        });
      });
  }

  getEventCoords(event: Event): MouseCoordinatesInterface {
    const host: Touch = getEventHost(event as TouchEvent) as Touch;

    return {
      pageX: host.pageX,
      pageY: host.pageY,
      target: host.target as HTMLElement,
    };
  }

  getEventObservable(element: HTMLElement | Window, eventName: TouchEventName): Observable<Event> {
    return observableFromEvent(element, this.eventNames[eventName]).pipe(takeUntil(this.ngUnsubscribe));
  }

  isTouchDevice(): boolean {
    if (this.mobileEmulator) {
      return true;
    }

    const prefixes: string[] = ' -webkit- -moz- -o- -ms- '.split(' ');
    const mq = (query: string) => {
      return window.matchMedia(query).matches;
    };

    // tslint:disable-next-line:no-string-literal
    if (('ontouchstart' in window) || window['DocumentTouch'] && document instanceof DocumentTouch) {
      return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    const query: string = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');

    return mq(query);
  }
}

const getEventHost = (event: TouchEvent): TouchEvent | Touch => {
  if (event.targetTouches && event.targetTouches.length) {
    return event.targetTouches[0];
  }
  if (event.changedTouches && event.changedTouches.length) {
    return event.changedTouches[0];
  }

  return event;
};
