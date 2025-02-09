import { Action } from '@ngrx/store';

export type ActionFnType = (...args : any[]) => TransactionAction;

export interface TransactionAction extends Action {
  type: string;
  payload?: any;
}
