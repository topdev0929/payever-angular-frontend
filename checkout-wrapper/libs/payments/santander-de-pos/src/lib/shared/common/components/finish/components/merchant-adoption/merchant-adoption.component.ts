import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  Renderer2,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Subscription, interval, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { catchError, map, skip, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { SantanderDePosFlowService, GuarantorRelation } from '@pe/checkout/santander-de-pos/shared';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { ParamsState, PatchParams } from '@pe/checkout/store';
import { AuthSelectors } from '@pe/checkout/store/auth';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';


export interface NodePaymentResponseDetailsInterface {
  signingUrl: string;
  customerSigningLink: string;
  guarantorSigningLink: string;
}

@Component({
  selector: 'santander-de-pos-merchant-adoption',
  templateUrl: './merchant-adoption.component.html',
  styleUrls: ['./merchant-adoption.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})

export class MerchantAdoptionComponent implements OnChanges {

  private readonly token = this.store.selectSnapshot(AuthSelectors.accessToken);

  @SelectSnapshot(ParamsState)
  private readonly params: CheckoutStateParamsInterface;

  @Input() flow: FlowInterface = null;
  @Input() payment: PaymentInterface = null;
  @Input() set nodeResult(payment: NodePaymentResponseInterface<any>) {
    this._nodeResult = payment;
  }

  get nodeResult(): NodePaymentResponseInterface<any> {
    return this._nodeResult;
  }

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() isEditMode = false;

  contractBoxRef: ElementRef<HTMLElement> = null;
  @ViewChild('contractBox') set setContractBox(element: ElementRef<HTMLElement>) {
    if (element) {
      this.contractBoxRef = element;
      const tagA = Array.from(this.contractBoxRef.nativeElement.children).find(child => child.tagName === 'A');
      let isSending = false;
      this.sendingSignature$.pipe(
        skip(1),
        tap((sending) => {
          isSending = sending;

          if (sending) {
            this.renderer.removeAttribute(tagA, 'href');
          } else {
            this.renderer.setAttribute(tagA, 'href', this.prepareContractLink());
          }
        }),
        takeUntil(this.destroy$)
      ).subscribe();

      this.renderer.listen(tagA, 'click', () => {
        if (isSending) {
          return;
        }

        this.isContractDownloaded = true;
        this.cdr.detectChanges();
      });
    }
  }

  borrowerPersonTitle1 = $localize `:@@payment-santander-de-pos.inquiry.finish.adoption.merchant.borrower:${1}:personNumber:`;
  borrowerPersonTitle2 = $localize `:@@payment-santander-de-pos.inquiry.finish.adoption.merchant.borrower:${2}:personNumber:`;
  contractHtml = '';

  _nodeResult: NodePaymentResponseInterface<any> = null;
  isWaiting = false;
  isCustomerSending$ = new BehaviorSubject<boolean>(false);
  isGuarantorSending$ = new BehaviorSubject<boolean>(false);
  customerSigningLink$ = new BehaviorSubject<string>(null);
  guarantorSigningLink$ = new BehaviorSubject<string>(null);
  isContractDownloaded = false;
  isCustomerSended = false;
  isGuarantorSended = false;
  errorMessage: string = null;

  sendingSignature$ = combineLatest([
    this.isCustomerSending$,
    this.isGuarantorSending$,
  ]).pipe(map(([customerSending, guarantorSending]) => customerSending || guarantorSending));

  get isGuarantor(): boolean {
    return this.nodeResult.paymentDetails.guarantorType !== GuarantorRelation.NONE;
  }

  get isApproved(): boolean {
    return [
      PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
      PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG,
      PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
    ].indexOf(this.nodeResult.payment.specificStatus) >= 0;
  }

  get isAccepted(): boolean {
    return this.nodeResult.payment.specificStatus === PaymentSpecificStatusEnum.STATUS_SIGNED;
  }

  get hideSigning(): boolean {
    return this.isEditMode && (!this.params.sendingPaymentSigningLink)
      && (
        (
          (this.nodeResult.paymentDetails.isCustomerSigningTriggered
            || this.nodeResult.paymentDetails.isGuarantorSigningTriggered)
          && this.nodeResult.paymentDetails.isFullySigned
        ) || (
          (this.nodeResult.paymentDetails.customerSigned || this.nodeResult.paymentDetails.guarantorSigned)
          && this.nodeResult.paymentDetails.isFullySigned
        ) || (!this.nodeResult.paymentDetails.customerSigningLink
          && this.nodeResult.paymentDetails.isCustomerSigningTriggered)
      );
  }

  constructor(
    private readonly store: Store,
    protected customElementService: CustomElementService,
    private cdr: ChangeDetectorRef,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private nodeFlowService: NodeFlowService,
    private santanderDePosFlowService: SantanderDePosFlowService,
    private renderer: Renderer2,
    private apiService: ApiService,
    private externalRedirectStorage: ExternalRedirectStorage,
    private destroy$: PeDestroyService,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'sign-contract',
      'progress-94',
    ], null, this.customElementService.shadowRoot);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { flow, nodeResult } = changes;

    if (flow?.currentValue && nodeResult?.currentValue) {
      this.contractHtml = $localize `:@@payment-santander-de-pos.inquiry.finish.adoption.merchant.note15:${this.prepareContractLink()}:contractLink:`;
    }
  }

  sendCustomerSigningLink(): void {
    this.isCustomerSended = false;
    this.isCustomerSending$.next(true);
    this.errorMessage = null;
    if (!this.nodeResult.paymentDetails.customerSigned) {
      this.santanderDePosFlowService.postPaymentActionSimple<NodePaymentResponseDetailsInterface>(
        'start-signing-customer'
      ).pipe(
        tap((data) => {
          this.isCustomerSended = true;
          this.runUpdatePayment('customerSigned');
          this.saveDataBeforeRedirect();
          this.customerSigningLink$.next(data.paymentDetails.customerSigningLink);
        }),
        catchError((err) => {
          this.isCustomerSending$.next(false);
          this.cdr.detectChanges();

          return throwError(err);
        })
      ).subscribe();
    } else {
      this.runUpdatePayment('customerSigned');
    }
  }

  isSigned(fieldName: string): boolean {
    return this.nodeResult.paymentDetails[fieldName];
  }

  sendGuarantorSigningLink(): void {
    this.isGuarantorSended = false;
    this.isGuarantorSending$.next(true);
    this.errorMessage = null;
    if (!this.nodeResult.paymentDetails.guarantorSigned) {
      this.santanderDePosFlowService.postPaymentActionSimple<NodePaymentResponseDetailsInterface>(
        'start-signing-guarantor'
      ).pipe(
        tap((data: any) => {
          this.isGuarantorSended = true;
          this.runUpdatePayment('guarantorSigned');
          this.saveDataBeforeRedirect();
          this.guarantorSigningLink$.next(data.paymentDetails.guarantorSigningLink);
        }),
        catchError((err) => {
          this.isGuarantorSending$.next(false);
          this.cdr.detectChanges();

           return throwError(err);
        })
      ).subscribe();
    } else {
      this.runUpdatePayment('guarantorSigned');
    }
  }

  prepareContractLink(): string {
    return `${this.env.thirdParty.payments}/api/download-resource/business/${this.flow?.businessId}`
    + `/integration/santander_pos_installment/action/offline-signing?paymentId=${this.nodeResult?.id}`
    + `&access_token=${this.token}`;
  }

  private saveDataBeforeRedirect() {
    // Why we have to save whole flow at server?
    // Because of Safari. When it's inside iframe it has isolated local storage.
    // So when we redirect back to page, we loose all information. As result we have to temporary keep it on server.
    // Also it's needed when we start payment at one domain (and wrapper is not iframe but web component)
    // and continue at checkout payever domain (after redirect back)
    this.apiService._getFlow(this.flow.id).pipe(
      switchMap(flow => this.externalRedirectStorage.saveDataBeforeRedirect(flow))
    ).subscribe();
  }

  private runUpdatePayment(fieldName: string): void {
    const start: number = Math.floor(Date.now());
    const delay: number = 6 * 1000;
    const timeout: number = 5 * 60 * 1000;
    this.errorMessage = null;
    this.store.dispatch(new PatchParams({ sendingPaymentSigningLink: true }));

    const sub: Subscription = interval(delay).pipe(
      takeWhile(() => !this.isAccepted && Math.floor(Date.now()) < (start + timeout)),
      switchMap(() => this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
        tap((nodePaymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>) => {
          this.nodeResult = nodePaymentResponse;

          if (this.nodeResult.paymentDetails[fieldName]) {
            sub.unsubscribe();
            this.isCustomerSending$.next(false);
            this.isGuarantorSending$.next(false);
          }

          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.errorMessage = err.message || 'Unknown error!';
          this.cdr.detectChanges();

          return throwError(err);
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
