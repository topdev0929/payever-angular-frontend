import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header" },
  { step: "shipping-step", header: "shipping-step-header" },
];

const bankAccountModal = (show: boolean) => {
  const delay = delayedExecution(250);
  delay(() => {
    showElement("bank-account-modal", show);
  });
}

const bankAccountCaptchaModal = (show: boolean) => {
  const delay = delayedExecution(250);
  delay(() => {
    showElement("bank-account-captcha-modal", show);
  });
}

const transactionSuccessfulModal = (show: boolean) => {
  const delay = delayedExecution(250);
  delay(() => {
    showElement("transaction-successful-modal", show);
  });
}

const handlePaymentStep = (show: boolean) => {
  const delay = delayedExecution(600);

  toggleClass("checkmark-click", "animate-once-short", show);

  delay(() => {
    toggleClass("checkmark-input", "checked", show )
  });

  const delayButton = delayedExecution(1000);
  delayButton(() => {
    toggleClass("step-3-click", "animate-once", show);
  })
}

export const instantPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-shipping-step",
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const shippingStepDynamicHeigh = step > 1;
    const showActivePaymentMethodStep = step >= 2;

    toggleClass("main-container", containerClasses[index], isActive);
    toggleClass(headerClass, "active", isActive);
    toggleClass('payment-method-step', "active", showActivePaymentMethodStep);
    toggleClass("payment-method-step-header", "active", showActivePaymentMethodStep);
    handlePaymentStep(step === 2);
    showElement("checkmark-input", step >= 3);

    if (step !== 4) {
      toggleClass(stepClass, "active", isActive);
    }
   
    toggleClass("shipping-step-header", "dynamic-height", shippingStepDynamicHeigh);
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
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-4-click", "step-4-click", "step-5-click"];

  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  bankAccountModal(step === 3);
  bankAccountCaptchaModal(step === 4);
  transactionSuccessfulModal(step === 5);

  showElement("modal-backdrop", step >= 3);
  showElement("bank-account-captcha-modal", false);
  showElement("bank-account-modal", false);
  showElement("transaction-successful-modal", false);
  const delay = delayedExecution(250);
  delay(() => {
    showElement("modal-backdrop", step >= 3);
  });
}