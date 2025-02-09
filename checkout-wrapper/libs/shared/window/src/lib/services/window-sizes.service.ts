import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { ScreenTypeEnum } from './window-enum';

export type WindowSizeInterface = {
  matchedScreenType: ScreenTypeEnum;
  isMobile: boolean;
}

@Injectable()
export class WindowSizesService {
  isMobile$: Observable<boolean>;
  private isMobileSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  windowSizeInfo$: Observable<WindowSizeInterface>;
  private windowSizeInfoSubject = new BehaviorSubject<WindowSizeInterface>({
    matchedScreenType: ScreenTypeEnum.Desktop,
    isMobile: false,
  });

  constructor() {
    this.isMobile$ = this.isMobileSubject.asObservable();
    this.windowSizeInfo$ = this.windowSizeInfoSubject.pipe(
      distinctUntilChanged((a, b) => a === b),
    );
    this.update();
    fromEvent(window, 'resize').subscribe(() => this.update());
  }

  public isMobile() {
    return this.isMobileSubject.getValue();
  }

  private queries: { [key: string]: () => boolean } = {
    [ScreenTypeEnum.Mobile]: () => window.matchMedia('(min-width: 0)').matches,
    [ScreenTypeEnum.Tablet]: () => window.matchMedia('(min-width: 744px)').matches,
    [ScreenTypeEnum.Desktop]: () => window.matchMedia('(min-width: 1024px)').matches,
  };

  private matchedTypes(): ScreenTypeEnum {
    return Object.entries(this.queries).map(([key, value]) => ([key, value()]))
      .filter(([, value]) => value)
      .map(([key]) => key as ScreenTypeEnum)
      .slice(-1)[0];
  }

  private update(): void {
    const matchedTypes = this.matchedTypes();
    const isMobile = matchedTypes === ScreenTypeEnum.Mobile;

    this.isMobileSubject.next(isMobile);
    this.windowSizeInfoSubject.next({
      matchedScreenType: matchedTypes,
      isMobile,
    });
  }
}
