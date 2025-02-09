import { Component, ChangeDetectionStrategy, OnInit, Injector, Inject } from '@angular/core';
import { BehaviorSubject, merge, timer } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout-types';
import { EnvironmentConfigInterface as EnvInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { AddressInterface } from '@pe/forms-core';
import { CheckoutMicroService } from '@pe/shared/checkout';

import { AbstractAction, ActionTypeEnum } from '../../../../shared';
import { DetailService } from '../../../services/detail.service';

import {
  ConstructorParameters,
  SignatureNotInitiatedStrategyClass,
  SignedStrategyClass,
  SignatureSentStrategyClass,
  EditStrategyInterface,
} from './classes';


export interface FlowDataInterface extends FlowInterface {
  connectionId?: string;
}

@Component({
  selector: 'pe-action-edit',
  templateUrl: 'edit.component.html',
  styles: [`
    .loader-wrapper {
      min-height: 320px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionEditComponent extends AbstractAction implements OnInit {

  error: string = null;

  viewConfig: any = {
    showCloseIcon: false,
    closeOnBackdrop: false,
    closeOnEsc: false,
    classes: {
      modalDialog: 'col-lg-8 col-md-8 col-sm-10 col-xs-12',
      modalBody: 'zero-padding',
    },
  };

  isLoadingMicro$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  billingAddress: AddressInterface = null;
  flowId: string = null;
  transactionId: string = null;
  flow: FlowDataInterface = null;
  isClose = false;
  editStrategy: EditStrategyInterface;
  isEditAble$: BehaviorSubject<boolean>;

  readonly getRemote$ = this.order$.pipe(
    switchMap(order => this.checkoutMicroService.getRemote(order.channel_set.uuid))
  );

  readonly defaultParams = {
    editMode: true,
    merchantMode: true,
    embeddedMode: true,
    forceNoScroll: true,
    forceNoPaddings: true,
    forceNoCloseButton: true,
  };

  constructor(
    public injector: Injector,
    @Inject(PE_ENV) private env: EnvInterface,
    protected destroy$: PeDestroyService,
    public detailService: DetailService,
    private checkoutMicroService: CheckoutMicroService,
  ) {
    super(injector);
  }

  get cancelSigningRequest(): boolean {
    return this.getStorageAction(ActionTypeEnum.Edit)?.cancelSigningRequest ?? true;
  }

  set cancelSigningRequest(val: boolean) {
    this.setStorageAction(ActionTypeEnum.Edit, {
      cancelSigningRequest: val,
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  close() {
    super.close();

    if (this.isEditAble$.value) {
      this.isClose = true;
      this.getData(true);
      this.refreshList();
    }
  }

  createForm(): void {
    if (this.isClose) {
      return;
    }

    this.isLoadingMicro$.next(true);
    this.flowId = this.order.payment_flow.id;
    this.transactionId = this.order.transaction.uuid;
    this.billingAddress = this.order.billing_address;
    this.initEditStrategy();
    this.cdr.detectChanges();
  }

  onLayoutShown(): void {
    timer(300).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoadingMicro$.next(false);
    });
  }

  private initEditStrategy(): void {
    const args: ConstructorParameters = [
      this.flowId,
      this.injector,
    ];

    if (this.isSignatureNotInitiated() || this.isSignatureWithdrawn()) {
      this.editStrategy = new SignatureNotInitiatedStrategyClass(...args);
    } else if (this.isSignatureSent()) {
      this.editStrategy = new SignatureSentStrategyClass(...args);
    } else if (this.isSigned()) {
      this.editStrategy = new SignedStrategyClass(...args);
    }

    this.runEdit();
  }

  private runEdit(): void {
    this.isEditAble$ = this.editStrategy.isEditAble$;
    merge(
      this.editStrategy.close$.pipe(
        tap(() => this.close())
      ),
      this.editStrategy.showError$.pipe(
        tap(err => this.showError(err))
      ),
      this.editStrategy.getData$.pipe(
        tap(reset => this.getData(reset))
      ),
      this.editStrategy.cancelSigningRequest$.pipe(
        tap(value => this.cancelSigningRequest = value)
      ),
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.checkFlow();
  }

  private checkFlow() {
    this.editStrategy.checkFlow();
  }

  private isSignatureNotInitiated(): boolean {
    return !this.order.details?.is_customer_signing_triggered
      && !this.order.details?.is_guarantor_signing_triggered
      && !this.order.details?.is_fully_signed;
  }

  private isSignatureSent(): boolean {
    return this.cancelSigningRequest &&
      (this.order.details?.is_customer_signing_triggered || this.order.details?.is_guarantor_signing_triggered)
      && !this.order?.details.is_fully_signed;
  }

  private isSignatureWithdrawn(): boolean {
    return this.order.details?.signature_withdrawn ?? false;
  }

  private isSigned(): boolean {
    return !this.cancelSigningRequest ||
      (this.order.details?.is_customer_signing_triggered || this.order.details?.is_guarantor_signing_triggered)
      && this.order.details?.is_fully_signed
      ||
      (this.order.details?.customer_signed || this.order.details?.guarantor_signed)
      && this.order.details?.is_fully_signed;
  }
}
