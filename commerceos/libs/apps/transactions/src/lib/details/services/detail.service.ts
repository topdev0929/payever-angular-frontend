/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Actions, Store, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, throwError, merge } from 'rxjs';
import { catchError, map, skipWhile, switchMap } from 'rxjs/operators';

import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { BodyDataInterface } from '../../shared';
import { ActionTypeEnum } from '../../shared/interfaces/action.type';
import {
  ActionRequestInterface,
  DetailInterface,
} from '../../shared/interfaces/detail.interface';
import { DetailsState, GetActions, GetDetails, PostAction } from '../store';
import { makeFormData } from '../utils';

import { SectionsService } from './sections.service';
import { TimelineService } from './timeline.service';

@Injectable()
export class DetailService {

  welcomeShown = false;
  timelineItems$ = this.store.select(DetailsState.order).pipe(
    map(order => this.timelineService.prepareTimeline(order, this.locale))
  );

  sectionsSubTitles$ = this.timelineItems$.pipe(
    map(timelineItems => this.sectionsService.prepareSectionsSubTitle(timelineItems, this.locale))
  );

  isReady$ = merge(
    this.actions.pipe(
      ofActionDispatched(GetDetails),
      skipWhile(() => {
        const order = this.store.selectSnapshot(DetailsState.order);

        return !!order;
      }),
      map(() => false)
    ),
    this.actions.pipe(
      ofActionCompleted(GetDetails),
      map(() => true)
    )
  );

  private orderId: string = null;
  private order$: Observable<DetailInterface> = this.store.select(DetailsState.order);
  private resetSubject$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private localeConstantsService: LocaleConstantsService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private timelineService: TimelineService,
    private sectionsService: SectionsService,
    private store: Store,
    private actions: Actions,
  ) {
    this.resetSubject$.next(false);
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  getData(orderId: string, reset: boolean = false): Observable<DetailInterface> {
    if (!reset && this.order$ && this.orderId === orderId) {
      return this.store.selectOnce(DetailsState.order);
    }

    this.orderId = orderId;

    return this.store.dispatch([
      new GetDetails(
        orderId,
        GetDetails.bypassCache,
      ),
    ]).pipe(
      switchMap(() => this.store.dispatch(new GetActions(this.orderId))),
      catchError((error: any) => {
        this.showError();

        return throwError(error);
      }),
    );
  }

  actionOrder(
    orderId: string,
    data: ActionRequestInterface,
    action: ActionTypeEnum,
    dataKey: string,
    serialize: boolean = false,
    bodyData?: BodyDataInterface,
  ): Observable<DetailInterface> {
    let requestBody: { [propName: string]: ActionRequestInterface } | ActionRequestInterface | string;

    let requestData: { [propName: string]: ActionRequestInterface } | ActionRequestInterface = {};
    if (serialize) {
      requestData[dataKey] = data;
      requestBody = makeFormData(requestData as any);
      if (!requestBody) {
        requestBody = dataKey === 'payment_shipping_goods' ? ({ payment_shipping_goods: {} } as any) : dataKey;
      }
    }
    else {
      if (dataKey) {
        requestData[dataKey] = data;
      } else {
        requestData = data;
      }

      requestBody = {
        ...bodyData,
        fields: requestData,
      };
    }

    return this.store.dispatch(new PostAction(orderId, action, requestBody, true)).pipe(
      catchError((error) => {
        if (!error) {
          return throwError(null);
        } else if (error.code === 403) {
          return throwError({ message: this.translateService.translate('errors.forbidden') });
        } else {
          return throwError({
            message: this.translateService.hasTranslation(`transactions.action-errors.${action}`)
              ? this.translateService.translate(`transactions.action-errors.${action}`)
              : this.translateService.translate('transactions.errors.unknown'),
          });
        }
      })
    );
  }

  private showError(): void {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate('transactions.errors.unknown'),
    });
  }
}
