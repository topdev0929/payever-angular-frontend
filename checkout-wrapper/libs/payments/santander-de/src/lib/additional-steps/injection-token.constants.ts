import { InjectionToken } from '@angular/core';

interface StepInputs {
  next: ()=>void;
  skip: ()=>void;
}

export const INPUTS = new InjectionToken<StepInputs>('INPUTS');