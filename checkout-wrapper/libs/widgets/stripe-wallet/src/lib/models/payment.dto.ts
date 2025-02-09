export interface PaymentDTO {
  paymentDetails: {
    redirectUrl: string;
  }
}

export interface ShippingOptionsDTO {
  country: string,
  zipCode: string,
}

export interface ShippingMethod {
  price: number;
  name: string;
  reference: string;
}

export interface ShippingMethods {
  shippingMethods: ShippingMethod[];
}
