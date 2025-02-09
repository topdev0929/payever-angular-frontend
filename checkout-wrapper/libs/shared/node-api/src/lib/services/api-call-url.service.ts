import { Injectable } from '@angular/core';

import {
  FlowInterface, NodePaymentResponseInterface, PaymentInterface,
} from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class ApiCallUrlService {

  getCustomerRedirectUrl(
    nodeResult: NodePaymentResponseInterface<any>, payment: PaymentInterface, flow: FlowInterface
  ): string {
    return nodeResult?._apiCall?.customerRedirectUrl || payment?.apiCall?.customerRedirectUrl ||
      flow?.apiCall?.customerRedirectUrl || null;
  }

  getSuccessUrl(
    nodeResult: NodePaymentResponseInterface<any>, payment: PaymentInterface, flow: FlowInterface
  ): string {
    return nodeResult?._apiCall?.successUrl || payment?.apiCall?.successUrl || flow?.apiCall?.successUrl || null;
  }

  getPendingUrl(
    nodeResult: NodePaymentResponseInterface<any>, payment: PaymentInterface, flow: FlowInterface
  ): string {
    return (nodeResult?._apiCall?.pendingUrl || nodeResult?._apiCall?.successUrl) ||
      (payment?.apiCall?.pendingUrl || payment?.apiCall?.successUrl) ||
      (flow?.apiCall?.pendingUrl || flow?.apiCall?.successUrl) || null;
  }

  getCustomerRedirectPendingUrl(
    nodeResult: NodePaymentResponseInterface<any>, payment: PaymentInterface, flow: FlowInterface
  ): string {
    return (nodeResult?._apiCall?.customerRedirectUrl
      || nodeResult?._apiCall?.pendingUrl
      || nodeResult?._apiCall?.successUrl)
      || (payment?.apiCall?.customerRedirectUrl
        || payment?.apiCall?.pendingUrl
        || payment?.apiCall?.successUrl)
      || (payment?.apiCall?.customerRedirectUrl
        || flow?.apiCall?.pendingUrl
        || flow?.apiCall?.successUrl)
      || null;
  }

  getFailureUrl(
    nodeResult: NodePaymentResponseInterface<any>, payment: PaymentInterface, flow: FlowInterface
  ): string {
    return nodeResult?._apiCall?.failureUrl || payment?.apiCall?.failureUrl || flow?.apiCall?.failureUrl || null;
  }

  canChangePaymentMethod(
    isDisableChangePaymentFlag: boolean, nodeResult: NodePaymentResponseInterface<any>, flow: FlowInterface
  ): boolean {
    return Boolean(!isDisableChangePaymentFlag && flow.paymentOptions && flow.paymentOptions?.length > 1) ||
      Boolean(nodeResult?._apiCall?.cancelUrl) ||
      Boolean(flow.apiCall?.cancelUrl);
  }

  getChangePaymentUrl(
    nodeResult: NodePaymentResponseInterface<any>,
    payment: PaymentInterface,
    flow: FlowInterface,
    useShopUrlIfEmpty = false,
  ): string {
    return (nodeResult?._apiCall
      ? (nodeResult._apiCall.failureUrl || nodeResult._apiCall.cancelUrl)
      : null)
      || (payment?.apiCall
        ? (payment.apiCall.failureUrl || payment.apiCall.cancelUrl)
        : null)
      || (flow?.apiCall
        ? (flow.apiCall.failureUrl || flow.apiCall.cancelUrl)
        : null)
      || (useShopUrlIfEmpty
        ? flow?.shopUrl
        : null)
      || null;
  }
}
