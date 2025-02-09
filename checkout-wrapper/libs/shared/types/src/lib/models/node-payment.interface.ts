import { CustomerType, PaymentMethodEnum, PaymentSpecificStatusEnum, PaymentStatusEnum } from '../enums';

import { CartItemOptionInterface } from './cart-item.interface';

export interface NodePaymentCartItemInterface {
  identifier?: string;
  name?: string;
  price?: number;
  quantity?: number;
  sku?: string;
  productId?: string;
  options?: CartItemOptionInterface[];
  extraData?: {
    subscriptionPlan?: string;
  };

  description?: string;
  priceNet?: number;
  thumbnail?: string;
  vatRate?: number;
  url?: string;
}

export interface NodePaymentAddressInterface {
  city?: string;
  country?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  salutation?: string;
  street?: string;
  streetName?: string;
  streetNumber?: string;
  region?: string;
  zipCode?: string;
}

export interface NodePaymentBaseInterface {
  flowId?: string;
  reference?: string;
  total?: number;
  amount?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  businessId?: string;
  businessName?: string;
  deliveryFee?: number;
  shippingOrderId?: string;
  shippingMethodName?: string;
  apiCallId?: string;
  channel?: string;
  channelSetId?: string;
  channelSource?: string;
  channelType?: string;
  customerType?: CustomerType;
  address?: NodePaymentAddressInterface;
  shippingAddress?: NodePaymentAddressInterface;
  downPayment?: number;
}

export interface NodePaymentInterface<PaymentDetails> {
  forceRedirect?: boolean;
  payment: NodePaymentBaseInterface;
  paymentItems?: NodePaymentCartItemInterface[];
  paymentDetails?: PaymentDetails;
  paymentDetailsToken?: string; // Instead of paymentDetails sometimes. Not used for now.
}
export interface NodePaymentEditInterface<PaymentDetails> extends NodePaymentInterface<PaymentDetails> {
  paymentId: string;
}

export interface NodeApiCallInterface {
  id: string;
  successUrl?: string;
  pendingUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
  noticeUrl?: string;
  customerRedirectUrl?: string;
}

export interface NodePaymentResponseInterface<PaymentResponseDetails> {
  id: string;
  createdAt: string;
  payment: {
    deliveryFee: number;
    paymentFee: number;
    amount: number;
    address: NodePaymentAddressInterface;
    apiCallId: string;
    businessId: string;
    businessName: string;
    channel: string;
    channelSetId: string;
    currency: string;
    customerEmail: string;
    customerName: string;
    downPayment: number;
    paymentType: PaymentMethodEnum;
    reference: string;
    shippingAddress: NodePaymentAddressInterface;
    specificStatus: PaymentSpecificStatusEnum; // Example: succeeded
    status: PaymentStatusEnum; // Example: STATUS_ACCEPTED
    total: number;
  };
  paymentDetails: PaymentResponseDetails;
  paymentItems: NodePaymentCartItemInterface[];
  options?: {
    merchantCoversFee?: boolean;
    shopRedirectEnabled?: boolean;
  };
  _apiCall?: NodeApiCallInterface;
}

export enum SigningStatusesEnum {
  Created = 'Created',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Expired = 'Expired',
  Deleted = 'Deleted',
}

export interface NodeSignStatusInterface {
  signingStatus: SigningStatusesEnum;
}

export interface NodeShopUrlsInterface {
  successUrl: string;
  failureUrl: string;
  pendingUrl?: string;
  cancelUrl: string;
}

export interface NodeAuthMitIDParams {
  productId: number;
  duration: number;
  frontPostBackUrl: string; // User will be redirected to this url after MitID auth
}

export interface NodeAuthMitIDRedirectData {
  applicationNumber: string;
  redirectUrl: string;
}

export interface NodeAuthSkatParams {
  applicationNumber: string;
  debtorId: string;
  frontPostBackUrl: string; // User will be redirected to this url after MitID auth
}

export interface NodeBankConsentParams {
  debtorId?: string;
  frontPostBackUrl?: string;
  consentSuccess?: boolean;
}

export interface NodeAuthSkatRedirectData {
  postUrl: string;
  postValues: { key: string, value: string }[];
}

export interface NodeBankConsentRedirectData {
  url: string;
}

export interface NodeDenmarkFormConfigParams {
  applicationNumber: string;
  debtorId: string;
}

export interface NodeDenmarkFormConfigData {
  cprProcess: boolean;
  taxProcess: boolean;
}

export interface NodeDenmarkInsuranceConfigParams {
  applicationNumber: string;
  debtorId: string;
  cpr?: string;
}

export interface NodeDenmarkInsuranceConfigData {
  insuranceEnabled: boolean;
  insuranceMonthlyCost: number;
  insurancePercent: number;
}

export interface NodePaymentPreInitializeData {
  publishKey: string;
  totalCharge: number;
}

export interface NodeSwedenSSNDetails {
  inquiryId: string;
  socialSecurityNumber: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  hasOpenApplications: boolean;
  salesScoringType: SalesScoringType;
}

export enum SalesScoringType {
  Authorization = 'Authorization',
  New = 'New',
}

export interface AnalyzeDocument {
  content: string; // base64
  type: string;
}

export interface SendDocument {
  documentType: string;
  filename: string;
  file: string; // base64 but without prefix
}

export interface AnalyzedDocumentsData {
  idDocument: {
    identificationDateOfExpiry: string;
    identificationDateOfIssue: string;
    identificationIssuingAuthority: string;
    identificationNumber: string;
    mrzRaw: string;
    name: string;
    typeOfIdentification: string;
  };
  idDocumentValidity: {
    dateOfBirthValid: boolean;
    dateOfExpiryValid: boolean;
    mrzValid: boolean;
    valid: boolean;
  };
  person: {
    address: string;
    city: string;
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    nameAtBirth: string;
    nationality: string;
    placeOfBirth: string;
    sex: string;
    street: string;
    streetNo: string;
    title: string;
    zip: string;
  };
}

