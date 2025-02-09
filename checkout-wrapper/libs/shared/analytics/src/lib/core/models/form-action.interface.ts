import { AnalyticActionEnum } from './analytic-action.enum';

export interface EventFormInterface {
  field: string;
  action: AnalyticActionEnum;
  form?: string;
  validationError?: string;
  validationTriggered?: boolean;
}

export interface FormActionsInterface {
  formActions: EventFormInterface[];
}

export interface FormInitDataInterface {
  formName: string;
  formFieldName: string;
}
