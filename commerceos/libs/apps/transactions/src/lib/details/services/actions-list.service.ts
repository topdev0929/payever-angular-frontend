/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout-types';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ApiService, SettingsService, StatusUpdaterService } from '../../services/';
import {
  ActionTypeUIEnum,
  ActionInterface,
  ActionMapInterface,
  ActionTypeEnum,
  DetailInterface,
  UIActionInterface,
} from '../../shared';
import { DetailsState, PostAction } from '../store';

import { DetailService } from './detail.service';

export const MAX_MAIN = 3;

type ActionEventsType = {
  [key in ActionTypeEnum]?: (order: DetailInterface, action?: ActionInterface) => void
}

@Injectable()
export class ActionsListService {
  private businessId: string = null;
  readonly actions$ = this.store.select(DetailsState.actions);

  private readonly actionEvents: ActionEventsType = {
    [ActionTypeEnum.ShippingGoods]: (order, action) => this.shippingGoodsClick(action, order),
    [ActionTypeEnum.SendSigningLink]: order => this.onPostAction(ActionTypeEnum.SendSigningLink),
    [ActionTypeEnum.Settle]: order => this.onPostAction(ActionTypeEnum.Settle),
    [ActionTypeEnum.UpdateStatus]: order => this.onClickCheckStatusAction(order),
    [ActionTypeEnum.MarkPaid]: order => this.onClickMarkPaidAction(order),
  }

  private get orderId(): string {
    const order = this.store.selectSnapshot(DetailsState.orderId);

    return order;
  }

  constructor(
    private apiService: ApiService,
    private domSanitizer: DomSanitizer,
    private detailService: DetailService,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private statusUpdaterService: StatusUpdaterService,
    private envService: EnvService,
    private confirmScreenService: ConfirmScreenService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private store: Store,
  ) {
    this.businessId = this.envService.businessId;
  }

  actionsMapper(actionsArr: ActionInterface[], order: DetailInterface): ActionMapInterface {
    const mainActions: UIActionInterface[] = [];
    const optionalActions: UIActionInterface[] = [];
    let actions: UIActionInterface[] = [];
    let mainIndex = 1;

    actionsArr?.forEach((action) => {
      actions = action.isOptional ? optionalActions : mainActions;
      const actionData: UIActionInterface = {
        action: action.action,
        type: ActionTypeUIEnum.Button,
        icon: this.getCDNIcon(action.action, 'icons-transactions/more', !action.isOptional && mainIndex <= MAX_MAIN),
        class: action.action,
        labelTranslated: action.label,
        onClick: () => {
          this.onClickOrderAction(action.action);
        },
      };

      switch (action.action) {
        case ActionTypeEnum.ShippingGoods: {
          if (order.transaction.example) {
            actions.push({
              ...actionData,
              onClick: () => {
                this.actionEvents[ActionTypeEnum.ShippingGoods](order, action);
              },
            });
          } else {
            actions.push(actionData);
          }
          break;
        }
        case ActionTypeEnum.DownloadContract: {
          actions.push(this.prepareDownloadContract(actionData, order));
          break;
        }
        default: {
          if (this.actionEvents[action.action]) {
            actions.push({
              ...actionData,
              onClick: () => {
                this.actionEvents[action.action](order, action);
              },
            });
          } else {
            actions.push(actionData);
          }

        }
      }

      !action.isOptional && mainIndex++;
    });

    return { mainActions, optionalActions };
  }

  getCDNIcon(icon: string, folder = 'icons-transactions', isMain = false): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/${folder}/${icon}${isMain ? '-w' : ''}.svg`) as string;
  }

  showError(error: any): void {
    this.snackbarService.toggle(true, {
      content: error?.message || 'Unknown_error',
      duration: 3000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  onClickOrderAction(action: ActionTypeEnum): void {
    if (action) {
      this.router.navigate([
        ...this.settingsService.baseUrl,
        { outlets: { details: ['details', this.orderId, { outlets: { actions: [action, this.orderId] } }] } },
      ], {
        queryParamsHandling: 'merge',
        skipLocationChange: true,
      });
    }
  }

  private onClickMarkPaidAction(order:DetailInterface) {
    const headings: Headings = {
      title: this.translateService.translate('transactions.form.mark_paid.headings.title'),
      subtitle: this.translateService.translate('transactions.form.mark_paid.headings.subtitle'),
      confirmBtnText: this.translateService.translate('transactions.form.mark_paid.headings.confirm'),
      declineBtnText: this.translateService.translate('transactions.form.mark_paid.headings.decline'),
    };
    const confirmObservable: Observable<boolean> = this.confirmScreenService.show(headings, true);
    confirmObservable.pipe(
      take(1),
      switchMap((confirmation) => {
        const request$ = this.store.dispatch(new PostAction(this.orderId, ActionTypeEnum.MarkPaid, {})).pipe(
          tap((order: DetailInterface) => this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid])),

          catchError((error) => {
            error.message = this.getActionMessageError(ActionTypeEnum.MarkPaid);
            this.showError(error);
            this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid]);

            return throwError(error);
          })
        );

        return confirmation ? request$ : EMPTY;
      })
    ).subscribe();
  }

  private shippingGoodsClick(action: ActionInterface, order: DetailInterface ): void {
    if (order.shipping.example_label) {
      this.onClickOrderAction(action.action);
    } else {
      this.detailService.actionOrder(
        this.orderId, {}, ActionTypeEnum.ShippingGoods, 'payment_shipping_goods', true
      ).pipe(
        tap(() => this.onClickOrderAction(action.action))
      ).subscribe();
    }
  }

  private getActionMessageError(action: ActionTypeEnum): string {
    return this.translateService.hasTranslation(`transactions.action-errors.${action}`)
      ? this.translateService.translate(`transactions.action-errors.${action}`)
      : this.translateService.translate('transactions.errors.unknown');
  }

  private prepareDownloadContract(actionData: UIActionInterface, order: DetailInterface): UIActionInterface {
    let action: UIActionInterface = actionData;
    if (order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT) {
      action = {
        ...action,
        type: ActionTypeUIEnum.LinkWithCallback,
        onClick: () => {
          this.detailService.getData(this.orderId, true).subscribe();
          this.statusUpdaterService.triggerUpdateStatus([this.orderId]);
        },
        showConfirm: true,
        confirmHeadings: {
          title: this.translateService.translate('transactions.details.actions.confirmation.contract.title'),
          subtitle: this.translateService.translate('transactions.details.actions.confirmation.contract.subtitle'),
          confirmBtnText: this.translateService.translate('transactions.details.actions.confirmation.contract.confirmBtnText'),
          declineBtnText: this.translateService.translate('transactions.details.actions.confirmation.contract.declineBtnText'),
        },
        href: this.settingsService.contractUrl[order.payment_option.type](this.businessId, order.transaction.original_id),
        errorMessage: this.translateService.translate('transactions.action-errors.contract'),
      };
    } else {
      action = {
        ...action,
        type: ActionTypeUIEnum.Link,
        href: this.settingsService.contractUrl[order.payment_option.type](this.businessId, order.transaction.original_id),
      };
    }

    return action;
  }

  private onPostAction(actionType: ActionTypeEnum): void {
    this.store.dispatch(new PostAction(this.orderId, actionType, {})).pipe(
      tap((order: DetailInterface) => this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid])),
      catchError((error) => {
        error.message = this.getActionMessageError(actionType);
        this.showError(error);

        return throwError(error);
      })
    ).subscribe();
  }

  private onClickCheckStatusAction(order: DetailInterface): void {
    this.apiService.checkSantanderStatus(this.orderId)
      .subscribe({
        next: () => {
          this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid]);
        },
        error: (error: HttpErrorResponse) => {
          this.showError(error.error);
        },
      });
  }
}
