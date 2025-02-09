import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
  { step: "more-information-step", header: "more-information-step-header"},
];

export const santanderInstallmentDEPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-payment-method-step",
    "active-shipping-step",
    "active-more-information-step"
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    toggleClass("main-container", containerClasses[index], isActive);
    toggleClass(headerClass, "active", isActive);

    if (step !== 6) {
      toggleClass(stepClass, "active", isActive);
    }
  });

  const moreInformationStep = step === 3;
  const showActiveEarningsAndExpensesStep = step >= 4;
  const earningsAndExpensesStep1 = step === 4;
  const earningsAndExpensesStep2 = step >= 5;
  const shippingStepDynamicHeight = step > 2;

  toggleClass('earnings-and-expenses-step', "active", showActiveEarningsAndExpensesStep);
  toggleClass("earnings-and-expenses-step-header", "active", showActiveEarningsAndExpensesStep);
  toggleClass("checkout-items", "more-information-step-offset", moreInformationStep);
  toggleClass("checkout-items", "earnings-and-expenses-step-offset-1", earningsAndExpensesStep1);
  toggleClass("checkout-items", "earnings-and-expenses-step-offset-2", earningsAndExpensesStep2);
  toggleClass("shipping-step-header", "dynamic-height", shippingStepDynamicHeight);

  const steps: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('step') as HTMLCollectionOf<HTMLElement>;
  const activeStepNode = document.querySelector('.step.active') as HTMLElement;

  if (activeStepNode) {
    [...steps].forEach((step: HTMLElement) => step.style.overflow = 'hidden');
    setTimeout(() => {
      activeStepNode.style.overflow = 'visible';
    }, 400);
  }

  updateElementsVisibility(step);
}

const updateElementsVisibility = (step: Step): void => {
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click", "step-4-click", "step-5-click", "step-6-click"];

  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });
  
  const delay = delayedExecution(250);
  delay(() => {
    showElement("identification-modal", step === 6);
    showElement("signature-modal",  step === 7);
    showElement("modal-backdrop", step >= 6);
  });
}