import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { selectedIndustry } from '../../../scripts/tools';
import { delayedExecution, showElement, toggleClass, hasClass, PRICES_KRONA, PRICES_WITH_FEE_KRONA } from '../../../scripts/common';

let currentStep: Step = 0;

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "account-step", header: "account-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "mit-id-and-skat-step", header: "mit-id-and-skat-step-header" },
  { step: 'application-details-step', header: 'application-details-step-header' },
  { step: 'application-details-step', header: 'application-details-step-header' },
  { step: 'application-details-step', header: 'application-details-step-header' },
  { step: 'application-details-step', header: 'application-details-step-header' },
  { step: 'application-details-step', header: 'application-details-step-header' },
];

export const santanderInstallmentDKPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-account-step",
    "active-shipping-step",
    "active-payment-method-step-1",
    "active-payment-method-step-2",
    "active-mit-id-and-skat-step",
    "active-application-details-step-1",
    "active-application-details-step-2",
    "active-application-details-step-3",
    "active-application-details-step-4",
    "active-application-details-step-5",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const isPaymentMethodStep: boolean = stepClass === "payment-method-step" && step >= 3 && step <= 4;
    const isApplicationDetailsStep = stepClass === "application-details-step" && step >= 6 && step <= 10;

    toggleClass("main-container", containerClasses[index], isActive);

     if ((isPaymentMethodStep || isApplicationDetailsStep) && hasClass(stepClass, "active")) {
      return;
    }

    toggleClass(stepClass, "active", isActive);
    toggleClass(headerClass, "active", isActive);
  });

  const accountStepDynamicHeight: boolean = step >= 2;
  const shippingStepDynamicHeigh: boolean = step >= 3;
  const paymentMethodStepDynamicHeigh: boolean = step === 5;

  toggleClass("account-step-header", "dynamic-height", accountStepDynamicHeight);
  toggleClass("shipping-step-header", "dynamic-height", shippingStepDynamicHeigh);
  toggleClass("payment-method-step-header", "dynamic-height", paymentMethodStepDynamicHeigh);
  
  const steps: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('step') as HTMLCollectionOf<HTMLElement>;
  const activeStepNode = document.querySelector('.step.active') as HTMLElement;

  if (activeStepNode) {
    [...steps].forEach((step: HTMLElement) => step.style.overflow = 'hidden');
    setTimeout(() => {
      activeStepNode.style.overflow = 'visible';
    }, 400);
  }

  currentStep = step;
  updateElementsVisibility(step);
  santanderInstallmentDKIndustryHandler();
}

const updateElementsVisibility = (step: Step): void => {
  const stepClicks: string[] = [
    "step-1-click",
    "step-2-click",
    "step-3-click",
    "step-4-click",
    "step-5-click",
    "step-6-click",
    "step-7-click",
    "step-8-click",
    "step-9-click",
    "step-10-click"
  ];
  const showSuccessfulModal: boolean = step === 10;
  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  showElement("modal-backdrop", false);
  showElement("transaction-successful-modal", false);

  const delay = delayedExecution(250);
  delay(() => {
    showElement("modal-backdrop", showSuccessfulModal);
    showElement("transaction-successful-modal", showSuccessfulModal);
  });
}

const priceTexts: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('price-text') as HTMLCollectionOf<HTMLElement>;
const priceWithFeeTexts: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('price-with-fee-text') as HTMLCollectionOf<HTMLElement>;

export const santanderInstallmentDKIndustryHandler = () => {
  const price = currentStep <= 4 ? PRICES_KRONA[selectedIndustry] : PRICES_WITH_FEE_KRONA[selectedIndustry];

  [...priceTexts].forEach((el) => {
    el.innerHTML = PRICES_KRONA[selectedIndustry];
  });

  [...priceWithFeeTexts].forEach((el) => {
    el.innerHTML = price;
  });
}