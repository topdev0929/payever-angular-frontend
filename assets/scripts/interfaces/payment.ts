import { Step } from "../types";

export interface PaymentDemoSetting {
  stepsCount: Step,
  stepsCountMobile?: Step,
  stepsHandler: (step: Step) => void,
  stepsIndustryHandler?: () => void,
  textClasses: string[],
}