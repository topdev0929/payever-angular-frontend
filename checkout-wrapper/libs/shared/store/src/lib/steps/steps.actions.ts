import { AccordionPanelInterface } from '@pe/checkout/types';

export class SetSteps {
  static readonly type = '[Steps] Set steps';
  constructor(public payload: AccordionPanelInterface[]) {}
}

export class OpenStep {
  static readonly type = '[Steps] Open step';
  constructor(public payload: AccordionPanelInterface | string) {}
}

export class CloseStep {
  static readonly type = '[Steps] Close step';
  constructor(public payload?: AccordionPanelInterface | string) {}
}

export class ToggleStep {
  static readonly type = '[Steps] Toggle step';
  constructor(public payload: string) {}
}

export class OpenNextStep {
  static readonly type ='[Steps] Open next step';
}

export class ForceOpenFinishStep {
  static readonly type ='[Steps] Force open finish step';
}

export class OpenNextStepSuccess {
  static readonly type = '[Steps] Open next step success';
}

export class OpenNextStepFail {
  static readonly type = '[Steps] Open next step fail';
  constructor(public error: any) {}
}

export class DisableSteps {
  static readonly type = '[Steps] Disable steps';
  constructor(public payload: AccordionPanelInterface[]) {}
}

export class DisableStepsAfter {
  static readonly type = '[Steps] Disable steps after';
  constructor(public payload: string | AccordionPanelInterface) {}
}

export class HideSteps {
  static readonly type = '[Steps] Hide steps';
  constructor(public payload: (AccordionPanelInterface | string)[]) {}
}

export class ShowSteps {
  static readonly type = '[Steps] Show steps';
  constructor(public payload: (AccordionPanelInterface | string)[]) {}
}

export class MarkNextStep {
  static readonly type = '[Steps] Mark next step';
  constructor(public stepName: string) {}
}
