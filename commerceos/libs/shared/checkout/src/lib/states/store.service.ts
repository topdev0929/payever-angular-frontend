import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { APP, THEME } from '../tokens';

const initialStore = {
  app: null,
  theme: null,
};

@Injectable({
  providedIn: 'root',
})
export class PeSharedCheckoutStoreService {
  private readonly appSubject$ = new BehaviorSubject(this.appInitial ?? null);

  get app() {
    return this.appSubject$.getValue();
  }

  set app(value) {
    this.appSubject$.next(value);
  }

  get channelSetId() {
    return this.app && (this.app.channelSet ?? this.app.channelSetId);
  }

  private readonly themeSubject$ = new BehaviorSubject(this.themeInitial ?? null);

  get theme() {
    return this.themeSubject$.getValue();
  }

  set theme(value) {
    this.themeSubject$.next(value);
  }

  constructor(
    @Optional() @Inject(APP) private readonly appInitial: any,
    @Optional() @Inject(THEME) private readonly themeInitial: any,
  ) {
  }

  reset(): void {
    this.app = initialStore.app;
    this.theme = initialStore.theme;
  }
}
