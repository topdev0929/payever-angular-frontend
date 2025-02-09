import { HttpClient } from '@angular/common/http';
import { Directive, EventEmitter, OnInit, Output, isDevMode } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { ApiService, NodeApiService, TrackingService } from '@pe/checkout/api';
import { SectionStorageService } from '@pe/checkout/form-utils';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { AuthSelectors } from '@pe/checkout/store';
import {
  ErrorInterface,
  FlowInterface,
  NodePaymentResponseInterface, NodeShopUrlsInterface,
  PaymentMethodEnum,
  TimestampEvent,
} from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PE_ENV } from '@pe/common/core';

import { TYPE_CREDIT_Z } from '../constants';
import { SantanderNoFlowService } from '../services';
import {
  NodePaymentDetailsInterface,
  NodePaymentDetailsResponseInterface,
} from '../types';


@Directive()
export abstract class BaseContainerComponent extends AbstractPaymentContainerComponent
  implements OnInit {
  readonly PaymentMethodEnum: typeof PaymentMethodEnum = PaymentMethodEnum;

  errorMessage: string;

  @Output('onLoading') onLoading = new EventEmitter<boolean>();

  @Output('showRatesStepEdit') onShowRatesStepEdit =
    new EventEmitter<TimestampEvent>();

  flow: FlowInterface;
  errors: ErrorInterface;
  nodeResult: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

  protected apiService = this.injector.get(ApiService);
  protected nodeApiService = this.injector.get(NodeApiService);
  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected http = this.injector.get(HttpClient);
  protected env = this.injector.get(PE_ENV);
  protected sectionStorageService: SectionStorageService = this.injector.get(SectionStorageService);
  protected santanderNoFlowService = this.injector.get(SantanderNoFlowService);
  protected trackingService = this.injector.get(TrackingService);
  private localeConstantService = this.injector.get(LocaleConstantsService);

  get isPos(): boolean {
    return (
      this.paymentMethod === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.nodeResult =
      this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
  }

  isNeedMoreInfo(): boolean {
    return this.santanderNoFlowService.isNeedMoreInfo(this.nodeResult);
  }

  protected getPaymentUrl(): string {
    return null; // null means default
  }

  protected onPostPaymentSuccess(): void {
    return;
  }

  protected sendPaymentData(formData: unknown): Observable<NodeShopUrlsInterface> {
    if (!this.paymentOption) {
      throw new Error('Payment method not presented in list!');
    }

    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    return forkJoin([
      this.nodeFlowService.assignPaymentDetails({}).pipe(take(1)),
      this.nodeFlowService.setPaymentDetails(nodePaymentDetails).pipe(take(1)),
    ]).pipe(
      switchMap(() => this.preparePayment()),
    );
  }

  protected preparePayment(): Observable<NodeShopUrlsInterface> {
    const locale = this.localeConstantService.getLang();

    return this.nodeApiService.getShopUrls(this.flow).pipe(
      tap((shopUrls) => {
        const checkoutWrapper: string = isDevMode() ? 'http://localhost:8090' : this.env.frontend.checkoutWrapper;

        const url = new URL(`${checkoutWrapper}/${locale}/pay/${this.flow.id}/redirect-to-payment`);
        url.searchParams.set('type', TYPE_CREDIT_Z);
        url.searchParams.set('guest_token', this.store.selectSnapshot(AuthSelectors.accessToken));

        this.nodeFlowService.assignPaymentDetails(
          {
            frontendSuccessUrl:
              shopUrls.successUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/success`,
            frontendCustomerApprovalApprovedUrl: url,
            frontendFailureUrl:
              shopUrls.failureUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/fail`,
            frontendCustomerApprovalManualUrl: url,
            frontendCancelUrl:
              shopUrls.cancelUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/cancel`,
            frontendCustomerApprovalDeclinedUrl: url,
          }
        );
      }),
    );
  }
}
