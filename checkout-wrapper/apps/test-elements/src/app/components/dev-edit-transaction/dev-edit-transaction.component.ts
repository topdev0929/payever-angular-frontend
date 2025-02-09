import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { LocalStorage } from 'ngx-webstorage';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Login, LoginResponse, SetTokens } from '@pe/checkout/store';
import { AddressInterface, FlowInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

import { BaseDevByComponent } from '../base-dev-by.component';

import { DetailInterface } from './detail.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-edit-transaction.component.html',
})
export class DevEditTransactionComponent extends BaseDevByComponent implements OnInit {

  flow$: Observable<FlowInterface> = null;
  showLoginForm = false;
  flowId: string = null;

  billingAddress$: BehaviorSubject<AddressInterface> = new BehaviorSubject<AddressInterface>(null);

  // TEST
  // email = 'payments.test@payever.org';
  // password = 'Payever123!';
  // @LocalStorage() private businessIdValue = '0495613e-f1e2-4541-a109-cee03fef7988';
  // @LocalStorage() private transactionIdValue = '4aeeb950-59a5-4067-ae35-11365200df66';

  // STAGING
  email = 'payments.staging@payever.org';
  password = 'Payever8800!';
  @LocalStorage() private businessIdValue = '0495613e-f1e2-4541-a109-cee03fef7988';
  @LocalStorage() private transactionIdValue = '488ba1fc-8ba2-471c-a1d4-eeb19fc4d3b7';

  private env = inject(PE_ENV);
  private http = inject(HttpClient);
  private store = inject(Store);

  ngOnInit(): void {
    this.defaultParams.editMode = true; // For edit transaction this one is always true
    this.defaultParams.forceNoScroll = true; // For edit transaction this one is always true
    setTimeout(() => {
      this.fetchAddress();
    }, 1000);
  }

  set businessId(businessId: string) {
    this.businessIdValue = businessId;
    this.fetchAddress();
  }

  get businessId(): string {
    return this.businessIdValue;
  }

  set transactionId(transactionId: string) {
    this.transactionIdValue = transactionId;
    this.fetchAddress();
  }

  get transactionId(): string {
    return this.transactionIdValue;
  }

  doAuth(): void {
    this.store.dispatch(new Login({
      email: this.email,
      plainPassword: this.password,
    })).pipe(
      switchMap(res => this.enableBusiness(this.businessId, res)),
    ).subscribe(() => {
      this.showLoginForm = null;
      window.location.reload();
    });
  }

  onEventEmitted(event: any): void {
    super.onEventEmitted( { detail: event });
  }

  private fetchAddress(): void {
    if (this.businessId && this.transactionId) {
      this.getTransactionDetails(this.businessId, this.transactionId).subscribe(
        (order: DetailInterface): void => {
          this.flowId = order.payment_flow.id;
          this.billingAddress$.next(order.billing_address);
          this.cdr.detectChanges();
        },
        (err) => {
          throw new Error(`Cant get transaction details: ${JSON.stringify(err)}`);
        }
      );
    }
  }

  private getTransactionDetails(businessUuid: string, orderUuid: string): Observable<DetailInterface> {
    return this.http.get<any>(
      `${this.env.backend.transactions}/api/business/${businessUuid}/transaction/${orderUuid}/details`,
    );
  }

  private enableBusiness(businessId: string, tokens?: LoginResponse): Observable<any> {
    return this.http.patch<any>(
      `${this.env.backend.auth}/api/business/${businessId}/enable`,
      null,
      {
        headers: new HttpHeaders().append('Authorization', `Bearer ${tokens.accessToken}`),
      },
    ).pipe(
      switchMap(tokens => this.store.dispatch(new SetTokens(tokens))),
    );
  }
}
