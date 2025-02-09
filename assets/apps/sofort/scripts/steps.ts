import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass, hasClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
];

export const sofortPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-shipping-step",
    "active-payment-method-step-1",
    "active-payment-method-step-2",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const isPaymentMethodStep: boolean = stepClass === "payment-method-step" && step >= 2;

    toggleClass("main-container", containerClasses[index], isActive);
    
    if (isPaymentMethodStep && hasClass(stepClass, "active")) {
      return;
    }

    toggleClass(headerClass, "active", isActive);
    toggleClass(stepClass, "active", isActive);
  });

  toggleClass("shipping-step-header", "dynamic-height", step > 1);
  toggleClass("checkout-items", "with-offset", step >= 2);

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
  const showSuccessfulModal: boolean = step === 3;
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click"];

  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  showElement("modal-backdrop", showSuccessfulModal);
  showElement("transaction-successful-modal", false);

  const delay = delayedExecution(250);
  delay(() => {
    showElement("modal-backdrop", showSuccessfulModal);
    showElement("transaction-successful-modal", showSuccessfulModal);
  });
}