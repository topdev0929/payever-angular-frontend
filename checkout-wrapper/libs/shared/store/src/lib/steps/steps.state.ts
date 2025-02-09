import { Injectable } from '@angular/core';
import {
  Action,
  Selector,
  SelectorOptions,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import produce from 'immer';

import {
  AccordionPanelInterface,
  PaymentMethodEnum,
  SectionType,
} from '@pe/checkout/types';

import { FlowState } from '../flow';
import { SubmitPayment } from '../payment';

import { UNIMPLEMENTED_STEPS, ONE_STEP_PAYMENTS } from './constants';
import {
  CloseStep,
  DisableSteps,
  DisableStepsAfter,
  HideSteps,
  MarkNextStep,
  OpenNextStep,
  OpenStep,
  SetSteps,
  ShowSteps,
  ToggleStep,
} from './steps.actions';

interface StepsStateModel {
  steps: AccordionPanelInterface[];
  hiddenPayments: PaymentMethodEnum[];
  markedNext: string;
}

@State({
  name: 'steps',
  defaults: {
    steps: null,
    hiddenPayments: null,
    markedNext: null,
  },
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class StepsState {

  @Selector() static allSteps(state: StepsStateModel) {
    return state.steps;
  }

  @Selector([StepsState.allSteps]) static steps(state: AccordionPanelInterface[]) {
    return state.filter(step => !step.hidden && !step.hiddenByState && !UNIMPLEMENTED_STEPS.includes(step.steps[0]));
  }

  @Selector([StepsState.steps]) static isHiddenStep(state: AccordionPanelInterface[]) {
    return (stepName: SectionType) => state.findIndex(step => step.name === stepName) === -1;
  }

  @Selector([StepsState.steps]) static nextStep(state: AccordionPanelInterface[]) {
    const currentStepIdx = state.findIndex(step => step.opened);

    return state[currentStepIdx + 1];
  }

  @Selector() static markedNext(state: StepsStateModel) {
    return state.markedNext;
  }

  @Selector() static getStepOptions(state: StepsStateModel) {
    return (stepName: SectionType) => state.steps.find(step => step.name === stepName)?.options;
  }

  @Selector() static getExcludedIntegrations(state: StepsStateModel) {
    return (stepName: SectionType) => state.steps.find(step => step.name === stepName)?.excludedIntegrations;
  }

  @Selector() static getAllowedOnlyIntegrations(state: StepsStateModel) {
    return (stepName: SectionType) => state.steps.find(step => step.name === stepName)?.allowedOnlyIntegrations;
  }

  constructor(private store: Store) {}

  @Action(SetSteps)
  setSteps({ patchState }: StateContext<StepsStateModel>, action: SetSteps) {
    patchState({ steps: action.payload });
  }

  @Action(OpenStep)
  openStep({ getState, patchState }: StateContext<StepsStateModel>, action: OpenStep) {
    const { steps } = getState();
    const stepName = typeof action.payload == 'string'
      ? action.payload
      : action.payload.name;

    const state = produce(steps, (draft) => {
      draft.forEach((step) => {
        const isTargetStep = step.name === stepName;
        step.opened = isTargetStep;
        isTargetStep && (step.disabled = false);
      });
    });

    patchState({ steps: state });
  }

  @Action(OpenNextStep)
  openNextStep({ dispatch }: StateContext<StepsStateModel>) {
    const steps = this.store.selectSnapshot(StepsState.steps);
    const flow = this.store.selectSnapshot(FlowState.flow);

    const { paymentMethod, connections = [] } = flow.paymentOptions.find(opt =>
      opt.connections.find(c => c.id === flow.connectionId)) || {};
    const { version } = connections.find(c => c.id === flow.connectionId) || {};
    const isOneStepPayment = ONE_STEP_PAYMENTS[paymentMethod]?.[version];

    const filteredSteps = steps.filter(step => isOneStepPayment ? step.name !== SectionType.Payment : !step.hidden);

    const currentStepIdx = filteredSteps.findIndex(step => step.opened);
    const isLastStep = filteredSteps.length - 1 === currentStepIdx;

    return dispatch(isLastStep
      ? new SubmitPayment()
      : new OpenStep(filteredSteps[currentStepIdx + 1].name)
    );
  }

  @Action(CloseStep)
  closeStep({ getState, patchState }: StateContext<StepsStateModel>, action: CloseStep) {
    const { steps } = getState();
    const stepName = action.payload ?
      typeof action.payload == 'string'
        ? action.payload
        : action.payload.name
      : steps.find(step => step.opened).name;

    const state = produce(steps, (draft) => {
      const step = draft.find(step => step.name === stepName);
      step.opened = false;
    });

    patchState({ steps: state });
  }

  @Action(ToggleStep)
  toggleStep({ getState, patchState }: StateContext<StepsStateModel>, action: ToggleStep) {
    const { steps } = getState();

    const state = produce(steps, (draft) => {
      const target = draft.find(step => step.name === action.payload);
      target.opened = !target.opened;
    });

    patchState({ steps: state });
  }

  @Action(DisableSteps)
  disableSteps({ getState, patchState }: StateContext<StepsStateModel>, action: DisableSteps) {
    const { steps } = getState();
    const stepsToDisable = action.payload.map(step => step.name);

    const state = produce(steps, (draft) => {
      draft.forEach((step) => {
        if (stepsToDisable.includes(step.name)) {
          step.disabled = true;
          step.opened = false;
        }
      });
    });

    patchState({ steps: state });
  }

  @Action(DisableStepsAfter)
  disableStepsAfter({ dispatch, getState }: StateContext<StepsStateModel>, action: DisableStepsAfter) {
    const { steps } = getState();
    const { payload } = action;
    const stepName = typeof payload == 'string' ? payload : payload.name;
    const stepIdx = steps.findIndex(step => step.name === stepName);
    const stepsToDisable = steps.slice(stepIdx + 1);

    dispatch(new DisableSteps(stepsToDisable));
  }

  @Action(HideSteps)
  hideSteps({ getState, patchState }: StateContext<StepsStateModel>, action: HideSteps) {
    const { steps } = getState();
    const stepsToHide = action.payload.map(step => typeof step == 'string' ? step : step.name);

    const state = produce(steps, (draft) => {
      draft.forEach((step) => {
        if (stepsToHide.includes(step.name)) {
          step.hidden = true;
        }
      });
    });

    patchState({ steps: state });
  }

  @Action(ShowSteps)
  showSteps({ getState, patchState }: StateContext<StepsStateModel>, action: HideSteps) {
    const { steps } = getState();
    const stepsToShow = action.payload.map(step => typeof step == 'string' ? step : step.name);

    const state = produce(steps, (draft) => {
      draft.forEach((step) => {
        if (stepsToShow.includes(step.name)) {
          step.hidden = false;
        }
      });
    });

    patchState({ steps: state });
  }

  @Action(MarkNextStep)
  markNextStep(
    { patchState }: StateContext<StepsStateModel>,
    { stepName }: MarkNextStep,
  ) {
    patchState({ markedNext: stepName });
  }
}
