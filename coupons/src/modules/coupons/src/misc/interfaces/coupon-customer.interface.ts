export interface PeCouponCustomerFieldValue {
  id: string;
  businessId: string;
  name: string;
  type: string;
  groupId: string;
}
export interface PeCouponCustomerField {
  id: string;
  fieldId: string;
  value: string;
  contactId: string;
  field: PeCouponCustomerFieldValue;
}

export interface PeCouponCustomerFieldWrapper {
  nodes: PeCouponCustomerField[];
}

export interface PeCouponCustomer {
  id: string;
  businessId: string;
  type: string;
  contactFields: {
    nodes: PeCouponCustomerField[];
  };
}