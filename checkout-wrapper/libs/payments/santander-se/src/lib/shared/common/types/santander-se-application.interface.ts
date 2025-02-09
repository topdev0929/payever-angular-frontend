import { SalesScoringType } from '@pe/checkout/types';

export interface SantanderSeApplicationResponse {
  purchaseAmount?: number;
  name?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  applyDate?: Date;
  campaignCode?: string;
  employmentFromDate?: Date;
  employmentToDate?: Date;
  employmentType?: string;
  phone?: string;
  income?: string;
  emailAddress?: string;
  purchaseId?: string;
  ocr?: string;
  cardNumber?: string;
  approvedAmount?: number;
  decisionCode?: string;
  reasonCode?: string;
  initialFee?: string;
  interest?: string;
  interestFreePeriod?: string;
  paymentFreePeriod?: string;
  possibleCreditLimit?: number;
  referenceNumber?: string;
  statementFee?: string;
  applicationId?: string;
  campaign?: unknown;
  accountCreationDate?: unknown;
  availableCredit?: number;
  totalCreditLimit?: number;
  salesScoringType: SalesScoringType;
  preApprovedLimit?: unknown
}
