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
  { step: 'additional-information-step', header: 'additional-information-step-header' },
  { step: 'additional-information-step', header: 'additional-information-step-header' },
  { step: 'additional-information-step', header: 'additional-information-step-header' },
];

export const santanderInstallmentNOPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-account-step",
    "active-shipping-step",
    "active-payment-method-step-1",
    "active-payment-method-step-2",
    "active-additional-information-1",
    "active-additional-information-2",
    "active-additional-information-3",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const isPaymentMethodStep: boolean = stepClass === "payment-method-step" && step >= 3 && step <= 4;
    const isAdditionalInformationStep = stepClass === "additional-information-step" && step >= 5 && step <= 7;

    toggleClass("main-container", containerClasses[index], isActive);

     if ((isPaymentMethodStep || isAdditionalInformationStep) && hasClass(stepClass, "active")) {
      return;
    }

    toggleClass(stepClass, "active", isActive);
    toggleClass(headerClass, "active", isActive);
  });

  const accountStepDynamicHeight: boolean = step >= 2;
  const shippingStepDynamicHeigh: boolean = step >= 3;

  toggleClass("account-step-header", "dynamic-height", accountStepDynamicHeight);
  toggleClass("shipping-step-header", "dynamic-height", shippingStepDynamicHeigh);

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
  santanderInstallmentNOIndustryHandler()
}

const updateElementsVisibility = (step: Step): void => {
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click", "step-4-click", "step-5-click", "step-6-click", "step-7-click"];
  const showSuccessfulModal: boolean = step === 7;
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

export const santanderInstallmentNOIndustryHandler = () => {
  const price = currentStep <= 3 ? PRICES_KRONA[selectedIndustry] : PRICES_WITH_FEE_KRONA[selectedIndustry];

  [...priceTexts].forEach((el) => {
    el.innerHTML = PRICES_KRONA[selectedIndustry];
  });

  [...priceWithFeeTexts].forEach((el) => {
    el.innerHTML = price;
  });
}