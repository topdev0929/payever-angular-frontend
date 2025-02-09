import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout-types';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';

import { ApiService } from '../../../../../services/api.service';
import { ActionErrorInterface, ActionTypeEnum, DetailInterface } from '../../../../../shared';
import { DetailsState } from '../../../../store';

export interface EditStrategyInterface {
  confirmHeadings: Headings;
  checkFlow: () => void;
  showConfirmation(): void;
  isEditAble$?: BehaviorSubject<boolean>;
  close$?: Subject<void>;
  showError$?: Subject<ActionErrorInterface>;
  getData$?: Subject<boolean>;
  cancelSigningRequest$?: Subject<boolean>;
}

export type ConstructorParameters = [
  flowId: string,
  injector: Injector,
];

interface FlowDataInterface extends FlowInterface {
  connectionId?: string;
}


export abstract class BaseEditStrategyClass {
  protected order: DetailInterface;

  isShowConfirmation = true;
  flowId: string = null;
  flow: FlowDataInterface = null;

  close$ = new Subject<void>();
  getData$ = new Subject<boolean>();
  showError$ = new Subject<ActionErrorInterface>();
  cancelSigningRequest$ = new Subject<boolean>();

  isEditAble$ = new BehaviorSubject<boolean>(false);

  protected getData: (reset?: boolean) => void;
  protected setStorageAction: (action: ActionTypeEnum, data: any) => void;
  protected getStorageAction: (action: ActionTypeEnum) => any;

  protected injector: Injector;
  protected translateService: TranslateService;
  protected apiService: ApiService;
  protected confirmScreenService: ConfirmScreenService;
  protected store: Store;
  protected destroy$: PeDestroyService;

  abstract get confirmHeadings(): Headings;
  abstract checkFlow(): void;
  abstract showConfirmation(): void;

  constructor(
    flowId: string,
    injector: Injector,
  ) {
    this.injector = injector;
    this.flowId = flowId;
    this.translateService = this.injector.get(TranslateService);
    this.apiService = this.injector.get(ApiService);
    this.confirmScreenService = this.injector.get(ConfirmScreenService);
    this.store = this.injector.get(Store);
    this.destroy$ = this.injector.get(PeDestroyService);

    this.store.select(DetailsState.order).pipe(
      tap(details => this.order = details),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  protected getFlowData(): void {
    this.apiService.getCheckoutFlow(this.flowId).subscribe({
      next: (flowData: FlowInterface) => {
        this.flow = flowData;
        this.showConfirmation();
      },
      error: (err) => {
        this.close$.next();
        err.message = this.translateService.translate('transactions.action-errors.edit');
        this.showError$.next(err);
      },
    });
  }

}
