
import { from as observableFrom,  Subject ,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface EventSubscription {
  un(): void;
}

@Injectable()
export class EventBusService {
  protected listeners: any = {};
  protected eventsSubject: Subject<any>;
  protected events: Observable<any>;

  protected fallbackEvent: any;

  constructor() {
    this.eventsSubject = new Subject();
    this.events = observableFrom(this.eventsSubject);

    const win: any = window;
    this.fallbackEvent = win['vent'];

    this.events.subscribe(({ name, args }) => {
      if ( this.listeners[name] ) {
        for ( const listener of this.listeners[name] ) {
          listener(...args);
        }
      }
      if ( this.fallbackEvent ) {
        this.fallbackEvent.trigger(name, ...args);
      }
    });
  }

  public on(name: string, listener: Function): EventSubscription {
    var listeners = this.listeners[name] || (this.listeners[name] = []);

    listeners.push(listener);

    return {
      un: () => {
        const idx = listeners.indexOf(listener);
        listeners.splice(idx, 1);
      }
    };
  }

  public emit(name: string, ...args: any[]) {
    this.eventsSubject.next({ name, args });
  }
}
