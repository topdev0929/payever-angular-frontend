import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { filter, map, share, take } from 'rxjs/operators';
import { cloneDeep, forEach } from 'lodash-es';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { ApiService, StatusType } from '../../shared';

interface UpdateStatusInterface {
  status?: StatusType;
  specificStatus?: string;
  isLoading: boolean;
}

interface MessageDataInterface {
  id: string;
  name: string;
  result: boolean;
  status: StatusType;
  specificStatus?: string;
}

@Injectable()
export class StatusUpdaterService {

  transactions: {[key: string]: BehaviorSubject<UpdateStatusInterface>} = {};

  private readonly updateStatusEventName: string = 'update-status';
  private webSocket$: Observable<WebSocket> = null;
  private openConnectionDelay: number = 0;

  constructor(
    private configService: EnvironmentConfigService,
    private apiService: ApiService,
    private authService: AuthService
  ) {
  }

  isLoading$(id: string): Observable<boolean> {
    return this.getById(id).pipe(map(a => a.isLoading));
  }

  getStatus$(id: string): Observable<StatusType> {
    return this.getById(id).pipe(map(a => a.status));
  }

  getSpecificStatus$(id: string): Observable<string> {
    return this.getById(id).pipe(map(a => a.specificStatus));
  }

  triggerUpdateStatus(ids: string[]): void {
    forEach(ids, id => {
      this.getById(id).pipe(take(1)).subscribe(data => {
        if (!data.isLoading) {
          data = cloneDeep(data);
          data.isLoading = true;
          this.getById(id).next(data);

          this.send(id);
        }
      });
    });
  }

  private send(id: string): void {
    this.webSocket().subscribe(ws => {
      if (ws) {
        ws.send(JSON.stringify({
           event: this.updateStatusEventName,
           data: {
             id: id,
             token: this.authService.token
           }
        }));
      }
    });
  }

  private getUrl(): string {
    if (this.configService.getConfig().backend['transactionsWs']) { // TODO Add interface
      return this.configService.getConfig().backend['transactionsWs'];
    }
    // TODO Remove after env.json update:
    return `${this.configService.getConfig().backend.transactions}/ws`.replace('https://', 'wss://');
  }

  private webSocket(): Observable<WebSocket> {
    if (!this.webSocket$) {
      const subject: BehaviorSubject<WebSocket> = new BehaviorSubject(undefined);
      this.webSocket$ = subject.asObservable().pipe(filter(a => a !== undefined));

      timer(this.openConnectionDelay).subscribe(() => {
        const webSocket: WebSocket = new WebSocket(this.getUrl());
        webSocket.onopen = () => {
          timer(10).subscribe(() => subject.next(webSocket));
        };
        webSocket.onmessage = m => {
          this.onWebSocketMessage(m);
        };
        webSocket.onerror = m => {
          console.error('WebSocket: Triggeted onerror', m);
          webSocket.close();
        };
        webSocket.onclose = m => {
          console.error('WebSocket: Triggeted onclose', m);
          timer(10).subscribe(() => {
            this.webSocket$ = null;
            this.setLoadingToAll(false);
            subject.next(null);
          });
        };
      });
    }
    return this.webSocket$.pipe(share());
  }

  private onWebSocketMessage(message: MessageEvent): void {
    const msgData: MessageDataInterface = JSON.parse(message.data);
    if (msgData && msgData.id && msgData.name === this.updateStatusEventName) {
      this.getById(msgData.id).pipe(take(1)).subscribe(data => {
        data = cloneDeep(data);
        data.isLoading = false;
        if (msgData.result) {
          data.status = msgData.status || data.status;
          data.specificStatus = msgData.specificStatus || data.specificStatus;
        }
        this.getById(msgData.id).next(data);
      });
    }
  }

  private getById(id: string): BehaviorSubject<UpdateStatusInterface> {
    if (!this.transactions[id]) {
      this.transactions[id] = new BehaviorSubject<UpdateStatusInterface>({ isLoading: false });
    }
    return this.transactions[id];
  }

  private setLoadingToAll(isLoading: boolean): void {
    forEach(this.transactions, (transaction: any, id: string) => {
      this.getById(id).pipe(take(1)).subscribe(data => {
        if (data.isLoading !== isLoading) {
          data = cloneDeep(data);
          data.isLoading = isLoading;
          this.getById(id).next(data);
        }
      });
    });
  }
}
