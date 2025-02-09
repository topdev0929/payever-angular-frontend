import { RegionRule, RegionRuleType } from "../../interfaces";

export const RegionRules: RegionRule[] = [
  {
    code: "coupons",
    type: RegionRuleType.Before,
    targetCode: "choosePayment",
  },
  {
    code: "choosePayment",
    type: RegionRuleType.Before,
    targetCode: "payment",
  },
  {
    code: "ocr",
    type: RegionRuleType.After,
    targetCode: "choosePayment",
    fixedPosition: true,
  },
];
