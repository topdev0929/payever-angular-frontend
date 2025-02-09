import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthSelectors, FlowState, Login, UpdateFlowAuthorization } from '@pe/checkout/store';
import { GetCompanyResponseDto, P2P_PAYMENTS, SalutationEnum } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

export interface ValidateEmailInterface {
  valid: boolean;
  available: boolean;
}

export interface UserInterface {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  language: string;
  phone: string;
  salutation: SalutationEnum;
  shippingAddresses: {
    apartment: string;
    city: string;
    country: string;
    street: string;
    zipCode: string;
  }[];
}

@Injectable()
export class UserService {

  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);
  private readonly env = inject(PE_ENV);

  public getCompanies(data: { company: string; country: string; }) {
    const { paymentOptions } = this.store.selectSnapshot(FlowState.flow);
    const paymentOption = paymentOptions.find(o => P2P_PAYMENTS.includes(o.paymentMethod));
    const connectionId = paymentOption?.connections?.[0]?.id;

    return this.http.post<GetCompanyResponseDto[]>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/company-search`,
      {
        ...data.country && {
          address: {
            country: data.country,
          },
        },
        company: {
          name: data.company,
        },
      },
    );
  }

  checkEmail(email: string): Observable<ValidateEmailInterface> {
    return this.http.get<ValidateEmailInterface>(
      `${this.env.backend.auth}/api/email/${encodeURIComponent(email)}/validate`
    );
  }

  resetPassword(email: string): Observable<string> {
    return this.http.post<void>(`${this.env.backend.auth}/api/forgot`, { email }).pipe(
      catchError(error => of(error.message || $localize `:@@error.unknown_error:`)),
      map(() => $localize `:@@user.reset_password_success:${email}:email:`),
    );
  }

  currentUserInfo(): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.env.backend.auth}/api/user`);
  }

  userLogin(email: string, password: string, flowId: string): Observable<UserInterface> {
    const oldToken= this.store.selectSnapshot(AuthSelectors.accessToken);

    return this.store.dispatch(new Login({ email, plainPassword: password })).pipe(
      switchMap(() => this.store.dispatch(new UpdateFlowAuthorization(flowId, oldToken))),
      switchMap(() => this.currentUserInfo()),
    );
  }
}
