import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass, hasClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "account-step", header: "account-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
];

export const santanderInstallmentNLPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-account-step",
    "active-shipping-step",
    "active-payment-method-step-1",
    "active-payment-method-step-2",
    "active-payment-method-step-3",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const isPaymentMethodStep: boolean = stepClass === "payment-method-step" && step >= 3;

    toggleClass("main-container", containerClasses[index], isActive);

     if ((isPaymentMethodStep) && hasClass(stepClass, "active")) {
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

  updateElementsVisibility(step);
}

const updateElementsVisibility = (step: Step): void => {
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click", "step-4-click"];
  const showOuterFrame: boolean = step >= 4;
  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  showElement("modal-backdrop", showOuterFrame);
  showElement("outer-frame", showOuterFrame);

  const delay = delayedExecution(250);
  delay(() => {
    showElement("modal-backdrop", showOuterFrame);
    showElement("outer-frame", showOuterFrame);
  });
}