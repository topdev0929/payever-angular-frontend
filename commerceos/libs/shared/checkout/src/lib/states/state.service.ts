import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { PE_ENV } from '@pe/common';

import {
  PeElementContext,
  ContextCart,
} from '../interfaces';


import { PeSharedCheckoutStoreService } from './store.service';


export interface PebClientState {
  'cart'?: PeElementContext<ContextCart[]>;
  }

const INITIAL_STATE: PebClientState = {
  'cart': {
    data: undefined,
  },
};

@Injectable()
export class PeSharedCheckoutStateService {

  get app() {
    return this.posStore.app;
  }

  get theme() {
    return this.posStore.theme;
  }

  constructor(
    private posStore: PeSharedCheckoutStoreService,
    @Optional() @Inject(PE_ENV) private env: any,
  ) {}

  private readonly stateSubject$ = new BehaviorSubject<PebClientState>(
    INITIAL_STATE,
  );

  get state$(): Observable<PebClientState> {
    return this.stateSubject$.asObservable();
  }

  get state(): PebClientState {
    return this.stateSubject$.value;
  }

  patch(value: Partial<PebClientState>): void {
    this.stateSubject$.next({
      ...this.state,
      ...value,
    });
  }
}
