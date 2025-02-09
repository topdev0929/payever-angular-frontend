export enum WeekOfDelivery {
  THIS_WEEK = 'this_week',
  NEXT_WEEK = 'next_week',
  OTHER_WEEK = 'other_week',
}

export enum DayOfFirstInstalment {
  FIRST_DAY = 1,
  FIFTEENTH_DAY = 15,
}

export enum PersonTypeEnum {
  Customer = 'customer',
  Guarantor = 'guarantor',
}

export enum DocumentSideEnum {
  Front = 'front',
  Back = 'back',
}

export enum GuarantorRelation {
  NONE = 'NONE',
  OTHER_HOUSEHOLD = 'OTHER_HOUSEHOLD',
  EQUIVALENT_HOUSEHOLD = 'EQUIVALENT_HOUSEHOLD',
}

export enum ResidenceTypesPOS {
  PAID_PROPERTY = 'OWN_PAID_PROPERTY',
  FOR_RENT = 'RENTAL',
  PROPERTY = 'OWN_PROPERTY',
  WITH_PARENTS = 'PARENTS'
}