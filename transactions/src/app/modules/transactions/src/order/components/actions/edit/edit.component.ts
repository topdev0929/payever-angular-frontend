import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout-sdk/sdk/api';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { AddressInterface, FlowInterface, PaymentMethodEnum } from '@pe/checkout-sdk/sdk/types';

import { ActionType, DetailInterface, HeaderService, PaymentInterface } from '../../../../shared';
import { SettingsService } from '../../../../shared';
import { DetailService } from '../../../services';

enum EditMode {
  Amount = 'amount',
  Cart = 'cart',
  Address = 'address'
}

@Component({
  selector: 'or-action-edit',
  styleUrls: ['./edit.component.scss'],
  templateUrl: 'edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionEditComponent implements OnDestroy, OnInit {

  readonly EditMode = EditMode;

  error: string = null;
  order: DetailInterface = {} as any;
  payment: PaymentInterface = {};

  viewConfig: any = {
    showCloseIcon: false,
    closeOnBackdrop: false,
    closeOnEsc: false,
    classes: {
      modalDialog: 'col-lg-8 col-md-8 col-sm-10 col-xs-12',
      modalBody: 'zero-padding'
    }
  };

  clonedFlow: FlowInterface;
  initialValues: any;
  paymentId: string;

  close$: Subject<void> = new Subject<void>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  editMode$: BehaviorSubject<EditMode> = new BehaviorSubject<EditMode>(null);

  private action: ActionType = null;
  private orderId: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private detailService: DetailService,
    private headerService: HeaderService,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {}

  get hasCart(): boolean {
    return this.clonedFlow && this.clonedFlow.cart && this.clonedFlow.cart.length > 0;
  }

  ngOnDestroy(): void {
    this.headerService.destroyShortHeader();
    this.destroyed$.next(true);
    this.destroyed$.complete();

    // Do same as in ResetTemporarySecondFactorGuard
    this.authService.resetTemporarySecondFactor().subscribe();
  }

  ngOnInit(): void {
    this.settingsService.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];

    this.headerService.setShortHeader('actions.edit', () => this.onCloseModal());

    this.getData();
    this.changeDetectorRef.detectChanges();
  }

  onAddressSaved(): void {
    this.editMode$.next(null);
    this.isLoading$.next(true);
    this.apiService._getFlow(this.clonedFlow.id).subscribe(flow => {
      this.clonedFlow = flow;
      this.isLoading$.next(false);
    });
  }

  onAmountSaved(flow: FlowInterface): void {
    this.editMode$.next(null);
    if (flow) {
      this.clonedFlow = flow;
    }
  }

  onCloseModal(): void {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  onServiceReadyChange(event: CustomEvent): void {
    // Don't remove this method !!!
  }

  private getData(): void {
    this.isLoading$.next(true);
    this.detailService.getData(this.settingsService.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
        const originalId: string = this.order.transaction.original_id;
        this.detailService.getOrderPayment(originalId, true).subscribe(
          (payment: PaymentInterface): void => {
            this.payment = payment;
            if (order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT) {
              this.isLoading$.next(false);
              this.initSantanderDEPOS(payment, this.order.billing_address as AddressInterface);
            } else {
              this.showError('form.edit.errors.not_implemented_payment');
            }
            this.changeDetectorRef.detectChanges();
          },
          () => {
            this.showError('form.edit.errors.cant_load_data');
          }
        );
      }, () => {
        this.showError('form.edit.errors.cant_load_data');
      }
    );
  }

  private onCheckoutModalClose(): void {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute }); // open order page
    this.detailService.reset = true;
  }

  private initSantanderDEPOS(payment: PaymentInterface, billingAddress: AddressInterface): void {
    this.isLoading$.next(true);
    this.apiService._cloneFlow(payment.payment_flow_id, true, null).pipe(
      flatMap(clonedFlow => this.apiService._getFlow(clonedFlow.id)), // Have to request again because BE returns shorten flow version when cloned
      flatMap(flow => this.apiService._addAddress(flow.id, {
        ...billingAddress,
        id: null
      })),
      flatMap(flow => this.apiService._getFlow(flow.id)), // TODO add passing `?_locale=` to addAddress(..) and remove additional getFlow
      flatMap(flow => {
        this.isLoading$.next(false);
        this.paymentId = payment.id;
        this.clonedFlow = flow;
        return this.apiService.getPaymentApplicationDataDe(payment.id);
      }),
      map((appData: any) => {
        if (!appData.guarantor_relation && payment && payment.payment_details) {
          if (payment.payment_details.guarantor_relation !== undefined) {
            appData.guarantor_relation = payment.payment_details.guarantor_relation;
          }
          if (payment.payment_details.legal_own_account !== undefined) {
            appData.legal_own_account = payment.payment_details.legal_own_account;
          }
        }
        this.initialValues = appData;
        return null;
      })
    ).subscribe(() => {
      this.changeDetectorRef.detectChanges();
    }, err => {
      console.error(err);
      this.showError('form.edit.errors.cant_load_data');
    });
  }

  private showError(translationKey: string): void {
    this.isLoading$.next(false);
    this.error = this.translateService.translate(translationKey);
    this.changeDetectorRef.detectChanges();
  }

}
