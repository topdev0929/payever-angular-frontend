import { EMPTY, Observable, race, Subject, timer } from 'rxjs';
import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { delay, filter, first, repeat, retry, retryWhen, takeUntil, tap } from 'rxjs/operators';

import { PeStudioAuthTokenService } from './token';

import {
    PebStudioWsEvents,
    PebStudioWsRequestMessage,
    PebStudioWsResponseMessage
} from './studio.ws.constants';
import { StudioEnvService } from './studio-env.service';
import { EnvService } from '@pe/common';

export const PE_STUDIO_WS_PATH = new InjectionToken<string>('PE_STUDIO_WS_PATH');

@Injectable()
export class PeStudioWs implements OnDestroy {

    private readonly close$ = new Subject<void>();
    private socketSubject$: WebSocketSubject<any>;
    readonly messages$ = new Subject<PebStudioWsResponseMessage>();

    private readonly reconnectDelay = 2000;
    private readonly pingInterval = 60000;

    constructor(
        @Inject(PE_STUDIO_WS_PATH) private studioWsPath: string,
        private studioAuthTokenService: PeStudioAuthTokenService,
        @Inject(EnvService) private envService: StudioEnvService,
    ) {
    }

    ngOnDestroy(): void {
        this.close();
    }

    connect(): void {
        if (!this.socketSubject$ || this.socketSubject$.closed) {
            this.socketSubject$ = webSocket({
                url: this.studioWsPath,
            });
            this.socketSubject$.pipe(
                tap(
                    message => this.messages$.next(message),
                    e => console.log('ws error', e),
                ),
                retryWhen(errors => errors.pipe(
                    tap(() => console.log('retry')),
                    delay(this.reconnectDelay),
                )),
            ).subscribe();
            race(
                timer(this.pingInterval).pipe(
                    tap(() => this.socketSubject$.next('ping')),
                ),
                this.socketSubject$.pipe(first()),
            ).pipe(
                repeat(),
                retry(),
                takeUntil(this.close$),
            ).subscribe();
        }
    }

    close(): void {
        this.close$.next();
        this.socketSubject$?.complete();
        this.socketSubject$.closed = true;
    }

    on(event: string): Observable<any> {
        return this.messages$?.pipe(
            filter(message => message?.name === event && !!message?.result),
        ) ?? EMPTY;
    }

    private createWsMessage(event: string, params: any): PebStudioWsRequestMessage {
        return { event, data: { params, token: this.studioAuthTokenService.token } };
    }


    getStudioAlbums(): void {
        const params: any = {
            businessId: this.envService.businessId,
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbums, {
            ...params,
        }));
    }

    deleteAlbum(albumId): void {
        const params: any = {
            businessId: this.envService.businessId,
            albumId
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.DeleteStudioAlbum, {
            ...params,
        }));
    }
    createAlbum(payload: { name: string, icon?: string }): void {
        const params: any = {
            businessId: this.envService.businessId,
            ...payload
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.CreateStudioAlbum, {
            ...params,
        }));
    }

    updateAlbum(payload: { name?: string, icon?: string }): void {
        const params: any = {
            businessId: this.envService.businessId,
            ...payload
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.UpdateStudioAlbum, {
            ...params,
        }));
    }

    getAlbumById(albumId): void {
        const params: any = {
            businessId: this.envService.businessId,
            albumId
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbumById, {
            ...params,
        }));
    }

    getAlbumByParent(albumId): void {
        const params: any = {
            businessId: this.envService.businessId,
            albumId
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbumByParent, {
            ...params,
        }));
    }

    getAlbumByAncestor(ancestorId): void {
        const params: any = {
            businessId: this.envService.businessId,
            ancestorId
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbumByAncestor, {
            ...params,
        }));
    }

    getAlbumByAttribute(payload): void {
        const params: any = {
            businessId: this.envService.businessId,
            ...payload
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbumByAttribute, {
            ...params,
        }));
    }

    getAlbumByMultipleAttributes(attributes): void {
        const params: any = {
            businessId: this.envService.businessId,
            attributes
        };
        this.socketSubject$.next(this.createWsMessage(PebStudioWsEvents.GetStudioAlbumByMultipleAttributes, {
            ...params,
        }));
    }
}
