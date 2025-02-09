import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { BusinessState } from '@pe/user';

import { MessageNameEnum, NotificationsResponseInterface } from './notification.interfaces';
import { PE_AUTH_TOKEN } from './token';

@Injectable({
  providedIn: 'any',
})
export class NotificationService implements OnDestroy {

  notificationsSocket = webSocket(this.env.backend.notificationsWs);

  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;
  private notificationsSubject$ = new BehaviorSubject<NotificationsResponseInterface>({ notifications:[],total:0,name:'',result:false })
  notofications = this.notificationsSubject$.asObservable()

  private readonly destroy$ = new Subject<void>();

  constructor(private store: Store,
              actions$: Actions,
              private authService: PeAuthService,
              @Inject(PE_AUTH_TOKEN) private token: string,
              @Inject(PE_ENV) private env: EnvironmentConfigInterface
  ) {
    const event = {
      event: MessageNameEnum.EVENT_CONNECTION,
      data: {
        token: this.authService.token,
      },
    };
    this.notificationsSocket.next(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
