import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PePlatformHeaderConfig, PePlatformHeaderItem, PePlatformHeaderService } from '@pe/platform-header';

@Injectable()
export class PlatformHeaderService extends PePlatformHeaderService {
  headerConfig$: BehaviorSubject<PePlatformHeaderConfig>;
  headerConfig: PePlatformHeaderConfig;

  config$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject(null);
  routeChanged$: Subject<string> = new Subject<string>();
  closeButtonClicked$: Subject<void> = new Subject<void>();
  previousUrlForBackChanged$: Subject<string> = new Subject<string>();

  /** Used to change current micro base url
   * If user clicks on something that need to show short header
   * This changing previousUrl so user could come back to the right place if he clicks 'Close"
   */
  previousUrl: string;
  constructor() {
    super();

    this.previousUrlForBackChanged$.asObservable().pipe(
      tap((url: string) => {
        this.previousUrl = url;
      })
    ).subscribe();
  }

  get config(): PePlatformHeaderConfig {
    return this.config$.getValue();
  }

  set config(config: PePlatformHeaderConfig) {
    this.config$.next(config);
  }

  setShortHeader(shortHeaderTitleItem: PePlatformHeaderItem): void {
    const config: PePlatformHeaderConfig = this.config;
    config.shortHeaderTitleItem = shortHeaderTitleItem;
    config.isShowShortHeader = true;
    config.currentMicroBaseUrl = this.previousUrl;
    this.config$.next({ ...config });
  }

  setFullHeader(): void {
    const config: PePlatformHeaderConfig = this.config$.getValue();
    config.shortHeaderTitleItem = null;
    config.isShowShortHeader = false;
    this.config$.next({ ...config });
  }

  assignConfig(config: PePlatformHeaderConfig): any {
    this.config$.next({
      ...this.config,
      ...config
    });
  }

  setConfig(config: PePlatformHeaderConfig): any {
    this.config$.next({ ...config });
  }
}
