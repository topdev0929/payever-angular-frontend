import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export enum BackdropActionsEnum {
  Hide = 'HideBackdrop',
  Show = 'ShowBackdrop'
}

export enum MicroContainerTypeEnum {
  InfoBox = 'InfoBox',
  Layout = 'Layout',
  FullScreen = 'FullScreen'
}

export enum EventEnum {
  Background = 'backgroundEvent',
  Header = 'headerEvent',
  LocaleChanged = 'localeChanged'
}

export enum DashboardEventEnum {
  AppReady = 'pe-app-ready',
  BlurryBackdrop = 'dashboard-blurry-backdrop',
  MicroContainer = 'dashboard-micro-container',
  MicroLoading = 'dashboard-micro-loading',
  MicroNavigation = 'dashboard-micro-navigation',
  SubmicroNavigation = 'submicro-navigation',
  SubmicroClose = 'submicro-close',
  DashboardBack = 'dashboard-back',
  CheckoutBack = 'checkout-back',
  SwitcherBack = 'switcher-back',
  ProfileMenuChange = 'profile-menu',
  ShowAppSelector = 'show-app-selector'
}

export interface PlatformEventInterface {
  target: string;
  action: string;
  data?: any;
}


@Injectable({ providedIn: 'root' })
export class AuthPlatformService {
  private cachedObserve$: Observable<PlatformEventInterface> = null;
  private readonly eventName = EventEnum.Background;

  get observe$(): Observable<any> {
    if (!this.cachedObserve$) {
      const messageRegex = /^pe:os:(.*?):(.*?)(?::(.*))?$/;

      this.cachedObserve$ = fromEvent(window, this.eventName).pipe(
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
        })
      );
    }

    return this.cachedObserve$;
  }

  dispatchEvent(event: any, origin: string = window.location.origin): void {
    let messageString = `pe:os:${event.target}:${event.action}`;

    if (event.data) {
      if (typeof event.data === 'string') {
        messageString += `:${event.data}`;
      } else {
        messageString += `:${JSON.stringify(event.data)}`;
      }
    }

    const backgroundEvent: Event = new CustomEvent('backgroundEvent', {
      detail: messageString,
    });

    window.dispatchEvent(backgroundEvent);
  }
}
