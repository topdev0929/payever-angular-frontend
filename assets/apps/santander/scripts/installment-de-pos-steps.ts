import { Step } from '../../../scripts/types';
import { StepClasses } from '../../../scripts/interfaces';
import { delayedExecution, showElement, toggleClass, hasClass } from '../../../scripts/common';

const stepClasses: StepClasses[] = [
  { step: "order-step", header: "order-step-header",  },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header" },
  { step: "payment-method-step", header: "payment-method-step-header", },
  { step: "personal-information-step", header: "personal-information-step-header" },
  { step: "additional-information-step", header: "additional-information-step-header" },
  { step: "additional-information-step", header: "additional-information-step-header" },
  { step: "income-expenses-step", header: "income-expenses-step-header" },
  { step: "income-expenses-step", header: "income-expenses-step-header" },
  { step: "income-expenses-step", header: "income-expenses-step-header" },
];

export const santanderInstallmentDEPoSPaymentSteps = (step: Step): void => {
  const containerClasses: string[] = [
    "active-order-step",
    "active-payment-method-step-1",
    "active-payment-method-step-2",
    "active-payment-method-step-3",
    "active-personal-information-step",
    "active-additional-information-step-1",
    "active-additional-information-step-2",
    "active-income-expenses-step-1",
    "active-income-expenses-step-2",
    "active-income-expenses-step-3"
  ];

  stepClasses.forEach(({ step: stepClass, header: headerClass }, index) => {
    const isActive: boolean = index === step;
    const isPaymentMethodStep: boolean = stepClass === "payment-method-step" && step >= 1 && step <= 3;
    const isAdditionalInformationStep: boolean = stepClass === "additional-information-step" && step >= 5 && step <= 6;
    const isIncomeExpensesStep: boolean = stepClass === "income-expenses-step" && step >= 7 && step <= 9;
  
    toggleClass("main-container", containerClasses[index], isActive);
    toggleClass("payment-method-step-header", "dynamic-height", step >= 4);

     if ((isPaymentMethodStep || isAdditionalInformationStep || isIncomeExpensesStep ) && hasClass(stepClass, "active")) {
      return;
    }

    toggleClass(stepClass, "active", isActive);
    toggleClass(headerClass, "active", isActive);
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
  const stepClicks: string[] = ["step-1-click", "step-2-click", "step-3-click", "step-4-click", "step-5-click", "step-6-click", "step-7-click", "step-8-click"];
  const showModalBackdrop: boolean = step >= 8;
  stepClicks.forEach((clickId: string, index: number) => {
    toggleClass(clickId, "animate-once", index === step);
  });

  showElement("identification-modal", false);
  showElement("signature-modal", false);
  showElement("modal-backdrop", showModalBackdrop);

  const delay = delayedExecution(250);
  delay(() => {
    showElement("identification-modal", step === 8);
    showElement("signature-modal",  step === 9);
    showElement("modal-backdrop", showModalBackdrop);
  });
}