import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { ReplaySubject } from 'rxjs';

import {
  PeMessageChannel,
  SetMailConfig,
  MessageState,
} from '@pe/message/shared';

import { PeForwardConfig, PeMailConfig } from './interfaces/mail-builder.interface';

@Injectable({
  providedIn: 'root',
})
export class PeMailBuilderService {

  @SelectSnapshot(MessageState.mailConfig) mailConfigSnapshot: PeMailConfig;

  constructor(
    private store: Store,
  ) {}

  blockRouteNavigation$ = new ReplaySubject<boolean | null>(1);
  replyConfig$ = new ReplaySubject<PeMessageChannel | null>(1);
  forwardConfig$ = new ReplaySubject<PeForwardConfig>(1);

  setMailConfig(mailConfig: PeMailConfig): void {
    this.store.dispatch(new SetMailConfig(mailConfig));
  }

  resetToolbar(): void {
    this.replyConfig$.next(null);
    this.forwardConfig$.next(null);
    this.store.dispatch(new SetMailConfig(null));
  }
}
