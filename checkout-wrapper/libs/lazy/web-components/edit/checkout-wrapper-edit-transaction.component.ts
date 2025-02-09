import { ChangeDetectionStrategy, Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ClearState, CloneFlow, FlowState, GetSettings, PatchFlow } from '@pe/checkout/store';
import {
  AddressInterface,
  FlowCloneReason,
  FlowInterface,
  PaymentMethodEnum,
  CheckoutStateParamsInterface,
} from '@pe/checkout/types';
import { camelCase } from '@pe/checkout/utils/camelcase';
import { BaseCheckoutWrapperComponent } from '@pe/checkout/web-components/shared';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-wrapper-edit-transaction',
  templateUrl: './checkout-wrapper-edit-transaction.component.html',
  styleUrls: [
    '../shared/base-web-component/base-checkout-wrapper.component.scss',
    './checkout-wrapper-edit-transaction.component.scss',

    // Instead of /lazy-styles.css we include styles directly:
    '../../../shared/styles/assets/ui-kit-styles/pe_style.scss',
    '../../../shared/styles/assets/temp-global-styles.scss',
    '../skeleton/styles.css',
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    PeDestroyService,
  ],
})
export class CheckoutWrapperEditTransactionComponent extends BaseCheckoutWrapperComponent {

  initialFlowId: string = null;
  @Input('flowId') set setFlowId(value: string) {
    this.initialFlowId = value;
    this.createFlow();
  }

  transactionId: string = null;
  @Input('transactionId') set setTransactionId(value: string) {
    this.transactionId = value;
    this.createFlow();
  }

  billingAddress: AddressInterface = null;
  @Input('billingaddress') set setBillingAddress(value: AddressInterface) {
    this.billingAddress = camelCase(value);
    this.createFlow();
  }

  params: CheckoutStateParamsInterface = {};
  @Input('params') set setParams(value: CheckoutStateParamsInterface) {
    this.params = {
      ...value,
      editMode: true,
    };
    if (Object.keys(value).length !== 0) {
      (window as any).peCheckoutParams = this.params;
    }
  }

  flowId: string = null;
  forceHide = false;
  lastError: any = null;

  private paymentMethod: PaymentMethodEnum = null;
  private isReadyToCreateFlow = false;
  private isCreatingFlow = false;

  private editTransactionStorageService = this.injector.get(EditTransactionStorageService);
  private nodeFlowService = this.injector.get(NodeFlowService);

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  getFlowId(): string {
    return this.flowId;
  }

  triggerCustomElementReadyCheck(): void {
    super.triggerCustomElementReadyCheck();
    this.isReadyToCreateFlow = true;
    this.createFlow();
  }

  createFlow(): void {
    if (!this.isCreatingFlow
      && this.isReadyToCreateFlow
      && this.initialFlowId
      && this.transactionId
      && this.billingAddress
      && !this.flowId) {
      this.isCreatingFlow = true;
      this.initSkeleton(null);
      this.customIsReadySubject.next(false);

      this.store.dispatch(new ClearState());

      this.cloneFlowWithAddress(this.initialFlowId, this.billingAddress).pipe(
        catchError((error) => {
          this.showError('Cant prepare data for flow!');
          this.isCreatingFlow = false;

          return throwError(error);
        }),
        switchMap(() => {
          const flow = this.store.selectSnapshot(FlowState.flow);
          this.params.editMode = true;
          this.flowId = flow.id;
          this.paymentMethod = flow.paymentOptions.find(p =>
            p.connections.find(c => c.id === flow.connectionId))?.paymentMethod;

          return this.nodeFlowService.getApplicationData(this.transactionId).pipe(
            catchError((error) => {
              this.showError('Cant get application data!');
              this.isCreatingFlow = false;

              return throwError(error);
            }),
            tap((appData) => {
              this.editTransactionStorageService.saveTransactionData(this.flowId, this.paymentMethod, appData);
              this.editTransactionStorageService.saveTransactionId(this.flowId, this.paymentMethod, this.transactionId);
              this.isCreatingFlow = false;
              this.customIsReadySubject.next(true);
              this.cdr.markForCheck();
            }),
          );
        }),
      ).subscribe();
    }
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event ? event.cloned : null;
    if (flow) {
      this.flowId = flow.id;
      this.flowCloned.emit(event);
      this.updateCustomElementView();
    } else {
      // Should never happen:
      // eslint-disable-next-line
      console.trace();
      this.showError('Invalid cloned flow data!');
    }
  }

  private cloneFlowWithAddress(flowId: string, address: AddressInterface): Observable<void> {
    const payload = address.type
     ? { [address.type]: { ...address, id: null } }
     : {} as FlowInterface;

    return this.store.dispatch(new CloneFlow({
      flowId,
      reason: FlowCloneReason.Unknown,
      skipData: true,
      redirect: false,
    })).pipe(
      switchMap(() => this.store.dispatch(new PatchFlow({ ...payload }))),
      switchMap(() => {
        const { channelSetId } = this.store.selectSnapshot(FlowState.flow);

        return this.store.dispatch(new GetSettings(channelSetId));
      }),
    );
  }
}
