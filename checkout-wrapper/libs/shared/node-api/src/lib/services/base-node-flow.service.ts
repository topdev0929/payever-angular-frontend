import { Injectable, Injector } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { FlowStorage } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import {
  AddressInterface,
  FlowInterface,
  NodePaymentAddressInterface,
  NodePaymentInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { extractStreetNameAndNumber } from '@pe/checkout/utils/address';

import { NodeFlowDataInterface } from '../interfaces';

const win = window as any;

@Injectable()
export abstract class BaseNodeFlowService {

  @SelectSnapshot(FlowState.flow) protected flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) protected paymentMethod: PaymentMethodEnum;

  protected flowStorage = this.injector.get(FlowStorage);

  constructor(protected injector: Injector) {}

  protected getNodeFlowData<PaymentDetailsOrFormToken, PaymentResponseDetails>():
  NodeFlowDataInterface<PaymentDetailsOrFormToken, PaymentResponseDetails> {
    const key = `pe_nodeFlowStore_${this.flow.id}`;
    if (!win[key]) {
      win[key] = this.flowStorage.getData(this.flow.id, 'nodeFlowStore', { paymentsData: {} });
    }

    return win[key];
  }

  protected saveNodeFlowDataToStorage<PaymentDetailsOrFormToken, PaymentResponseDetails>(
    data: NodeFlowDataInterface<PaymentDetailsOrFormToken, PaymentResponseDetails>
  ): void {
    this.flowStorage.setData(this.flow.id, 'nodeFlowStore', data, true);
  }


  protected flowToNodePayment<PaymentDetails>(): NodePaymentInterface<PaymentDetails> {
    const result: NodePaymentInterface<PaymentDetails> = {
      payment: {
        flowId: this.flow.id,
        reference: this.flow.reference,
        total: this.flow.total,
        amount: this.flow.amount,
        currency: this.flow.currency,
        customerName: this.flow.billingAddress ? `${this.flow.billingAddress?.firstName} ${this.flow.billingAddress?.lastName}`.trim() : null,
        customerEmail: this.flow.billingAddress ? this.flow.billingAddress?.email : null,
        businessId: this.flow.businessId,
        businessName: this.flow.businessName,
        deliveryFee: this.flow.deliveryFee || 0,
        shippingOrderId: this.flow.shippingOrderId || null,
        shippingMethodName: this.flow.shippingMethodName || null,
        apiCallId: this.flow.apiCall?.id,
        channel: this.flow.channel,
        channelSetId: this.flow.channelSetId,

        address: null,
        shippingAddress: null,
      },
      paymentItems: [],
    };

    this.flow.channelSource && (result.payment.channelSource = this.flow.channelSource);
    this.flow.channelType && (result.payment.channelType = this.flow.channelType);

    if (this.flow.billingAddress) {
      result.payment.address = this.flowAddressToNodePaymentAddress(this.flow.billingAddress);
    }
    if (this.flow.shippingAddressId) {
      const shippingAddress = this.flow.shippingAddresses.find(a => a.id === this.flow.shippingAddressId);
      result.payment.shippingAddress = this.flowAddressToNodePaymentAddress(shippingAddress);
    }
    if (this.flow.cart?.length) {
      (this.flow.cart || []).forEach((item) => {
        result.paymentItems.push({
          identifier: item.identifier,
          name: item.name,
          price: item.price,
          priceNet: item.priceNet,
          vatRate: item.vat,
          thumbnail: item.image,
          quantity: item.quantity,
          sku: item.sku,
          productId: item.productId || item._id || item.id,
          options: item.options,
          extraData: {
            subscriptionPlan: null,
          },
        });
      });
    }

    return result;
  }

  private flowAddressToNodePaymentAddress(address: AddressInterface): NodePaymentAddressInterface {
    const result: NodePaymentAddressInterface = {
      city: address.city,
      country: address.country,
      email: address.email,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      salutation: address.salutation,
      street: address.street,
      streetName: address.streetName || extractStreetNameAndNumber(address.street)[0],
      streetNumber: address.streetNumber || extractStreetNameAndNumber(address.street)[1],
      zipCode: address.zipCode,
    };

    return result;
  }
}
