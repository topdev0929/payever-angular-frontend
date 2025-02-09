import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AddressInterface, FlowInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';


export interface PaymentLink {
  city: string
  street: string,
  streetName: string,
  streetNumber: string,
  zip: string,
  socialSecurityNumber: string,
  shippingAddress: AddressInterface,
  salutation: string,
  region: string,
  addressLine2: string;
  country: string;
  countryName: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  houseExtension: string;
  amount: number;
  skipHandlePaymentFee: boolean,
  phone: string,
  paymentMethod: string,
  noticeUrl: string,
  pendingUrl: string,
  verifyType: string,
  extra: unknown,
  currency: string,
  orderRef: string,
}

@Injectable()
export class PayByLinkApiService {
  private env = inject(PE_ENV);
  private httpClient = inject(HttpClient);

  prepareDataAndPatchLink(id: string, flow: FlowInterface) {
    return this.patchLink(id, flow.businessId, {
      ...flow,
      ...flow.billingAddress && {
        ...flow.billingAddress,
        zip: flow.billingAddress.zipCode,
      },
      orderRef: flow.reference,
    });
  }

  private patchLink(id: string, businessId: string, data: Partial<PaymentLink>): Observable<PaymentLink> {

    const path = `${this.env.backend.checkout}/api/business/${businessId}/payment-link/${id}`;

    return this.httpClient.patch<PaymentLink>(path, data);
  }
}
