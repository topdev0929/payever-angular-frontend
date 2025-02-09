import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
];

export const idealPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-shipping-step",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const showActivePaymentMethodStep = step >= 2;

    toggleClass("main-container", containerClasses[index], isActive);
    toggleClass(headerClass, "active", isActive);
    toggleClass("payment-method-step-header", "active", showActivePaymentMethodStep);
    toggleClass('payment-method-step', "active", showActivePaymentMethodStep);

    toggleClass(stepClass, "active", isActive);
  
    toggleClass("shipping-step-header", "dynamic-height", step >= 2);
  });

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
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click"];
  const showTransactionModal: boolean = step === 3;

  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  showElement("modal-backdrop", false);
  showElement("transaction-successful-modal", false);

  const delay = delayedExecution(250);
  delay(() => {
    showElement("transaction-successful-modal", showTransactionModal);
    showElement("modal-backdrop", showTransactionModal);
  });
}
