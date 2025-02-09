import { Injectable } from '@angular/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { from, merge } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEditorAuthTokenService, PebWebsocketEventType, PebWebsocketService } from '@pe/builder/api';
import { PebElementDef, pebGenerateId, PebShape, PebShapeAlbum } from '@pe/builder/core';
import { runMigrations } from '@pe/builder/migrations';
import {
  PebCreateShapeAction,
  PebCreateShapeAlbumAction,
  PebDeleteShapeAction,
  PebDeleteShapeAlbumAction,
  PebInitShapesAction,
  PebSetShapeAlbumsAction,
  PebSetShapesAction,
  PebUpdateShapeAction,
  PebUpdateShapeAlbumAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

const MAX_ITEMS_PER_PAGE = 100;

@Injectable()
export class PebShapesActionHandler {

  private readonly init$ = this.actions$.pipe(
    ofActionDispatched(PebInitShapesAction),
    take(1),
    tap(() => {
      this.getShapeAlbums();
      this.getShapes();
    }),
  );

  private readonly createShapeAlbum$ = this.actions$.pipe(
    ofActionDispatched(PebCreateShapeAlbumAction),
    tap(({ payload }: PebCreateShapeAlbumAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.CreateShapeAlbum,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            pagination: { offset: 0, limit: MAX_ITEMS_PER_PAGE },
            applicationId: this.env.id,
            ...payload,
          },
        },
      });
    }),
  );

  private readonly updateShapeAlbum$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateShapeAlbumAction),
    tap(({ payload }: PebUpdateShapeAlbumAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.UpdateShapeAlbum,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            shapeAlbumId: payload.id,
            applicationId: this.env.id,
            ...payload,
          } as any,
        },
      });
    }),
  );

  private readonly deleteShapeAlbum$ = this.actions$.pipe(
    ofActionDispatched(PebDeleteShapeAlbumAction),
    tap(({ id }: PebDeleteShapeAlbumAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.DeleteShapeAlbum,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            applicationId: this.env.id,
            shapeAlbumId: id,
          } as any,
        },
      });
    }),
  );

  private readonly albums$ = this.websocketService.messages$.pipe(
    filter(msg => msg.name === PebWebsocketEventType.GetShapeAlbum && msg.result && msg.data),
    tap((msg) => {
      const albums: PebShapeAlbum[] = msg.data?.shapeAlbums;
      this.store.dispatch(new PebSetShapeAlbumsAction(albums));
    }),
  );

  private readonly albumChanged$ = this.websocketService.messages$.pipe(
    filter(msg =>
      [
        PebWebsocketEventType.CreateShapeAlbum,
        PebWebsocketEventType.UpdateShapeAlbum,
        PebWebsocketEventType.DeleteShapeAlbum,
      ].includes(msg.name as PebWebsocketEventType) &&
      msg.result &&
      msg.data
    ),
    tap(() => this.getShapeAlbums()),
  );

  private readonly createShape$ = this.actions$.pipe(
    ofActionDispatched(PebCreateShapeAction),
    tap(({ payload }: PebCreateShapeAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.CreateShape,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            applicationId: this.env.id,
            ...payload,
          },
        },
      });
    }),
  );

  private readonly updateShape$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateShapeAction),
    tap(({ payload }: PebUpdateShapeAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.UpdateShape,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            applicationId: this.env.id,
            shapeId: payload.id,
            ...payload,
          } as any,
        },
      });
    }),
  );

  private readonly deleteShape$ = this.actions$.pipe(
    ofActionDispatched(PebDeleteShapeAction),
    tap(({ id }: PebDeleteShapeAction) => {
      this.websocketService.send({
        event: PebWebsocketEventType.DeleteShape,
        data: {
          id: pebGenerateId(),
          token: this.authTokenService.token,
          businessId: this.env.business,
          params: {
            applicationId: this.env.id,
            shapeId: id,
          } as any,
        },
      });
    }),
  );

  private readonly shapeChanged$ = this.websocketService.messages$.pipe(
    filter(msg =>
      [
        PebWebsocketEventType.CreateShape,
        PebWebsocketEventType.UpdateShape,
        PebWebsocketEventType.DeleteShape,
      ].includes(msg.name as PebWebsocketEventType) &&
      msg.result &&
      msg.data
    ),
    tap((msg) => {
      if (msg.name === PebWebsocketEventType.CreateShape) {
        this.snackbarService.toggle(true, {
          content: this.translateService.translate('builder-app.shapes.saved_successfully'),
          duration: 2000,
          iconId: 'icon-commerceos-success',
        });
      }

      this.getShapes();
    }),
  );

  private readonly shapes$ = this.websocketService.messages$.pipe(
    filter(msg => msg.name === PebWebsocketEventType.GetShapeWithFilter && msg.result === true && msg.data),
    switchMap((msg) => {
      const shapes: PebShape[] = msg.data.shapes;
      const elements: PebElementDef[] = [].concat(...shapes.map(shape => shape.elements));

      return from(runMigrations(this.env, { elements: elements })).pipe(
        map(() => shapes),
      );
    }),
    tap(shapes => this.store.dispatch(new PebSetShapesAction(shapes))),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly websocketService: PebWebsocketService,
    private readonly authTokenService: PebEditorAuthTokenService,
    private readonly env: PeAppEnv,
    private readonly snackbarService: SnackbarService,
    private readonly translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(
      this.init$,
      this.createShapeAlbum$,
      this.updateShapeAlbum$,
      this.deleteShapeAlbum$,
      this.albumChanged$,
      this.albums$,
      this.createShape$,
      this.updateShape$,
      this.deleteShape$,
      this.shapeChanged$,
      this.shapes$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getShapes() {
    this.websocketService.send({
      event: PebWebsocketEventType.GetShapeWithFilter,
      data: {
        id: pebGenerateId(),
        token: this.authTokenService.token,
        params: {
          pagination: { offset: 0, limit: MAX_ITEMS_PER_PAGE },
          applicationId: this.env.id,
        },
      },
    });
  }

  private getShapeAlbums() {
    this.websocketService.send({
      event: PebWebsocketEventType.GetShapeAlbum,
      data: {
        id: pebGenerateId(),
        token: this.authTokenService.token,
        params: {
          pagination: { offset: 0, limit: MAX_ITEMS_PER_PAGE },
          applicationId: this.env.id,
        },
      },
    });
  }
}
