import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  AnalyticsFormService,
  EventFormInterface,
  FormActionsInterface,
  AnalyticFormStatusEnum,
  AnalyticConsentEventEnum,
  ConsentActionsInterface,
} from '../core';

import { AnalyticApiService } from './analytics-api.service';

type Action = FormActionsInterface | ConsentActionsInterface;

@Injectable()
export class AnalyticService implements AnalyticsFormService {
  flowId: string;
  paymentMethod: string;
  businessId: string;
  editMode = false;

  private emitEvent$ = new Subject<Action>();

  constructor(
    private analyticApiService: AnalyticApiService,
  ) {

    const analyticConsentEvents = new Set(Object.values(AnalyticConsentEventEnum));

    this.emitEvent$.pipe(
      filter(details => (!!details.formActions[0]?.field && !!details.formActions[0]?.form)
        || analyticConsentEvents.has((details as ConsentActionsInterface).formActions[0].action)),
    ).subscribe({
      next: (details) => {
        this.analyticApiService.doEmitEventForm(this.flowId, this.businessId, this.paymentMethod, details);
      },
    });
  }

  initAnalyticForm(flowId: string, businessId: string): void {
    this.flowId = flowId;
    this.businessId = businessId;
  }

  initPaymentMethod(paymentMethod: string): void {
    this.paymentMethod = paymentMethod;
  }

  initEditMode(editMode: boolean): void {
    this.editMode = editMode;
  }

  emitEventForm(formName: string, eventForm: EventFormInterface): void {
    if (!this.analyticReady()) {
      return;
    }
    const details: FormActionsInterface | ConsentActionsInterface = {
      formActions: [{
        ...eventForm,
        form: formName ?? eventForm.form,
      }],
    };

    this.emitEvent$.next(details);
  }

  emitEventFormItself(formName: string, status: AnalyticFormStatusEnum): void {
    if (!this.analyticReady()) {
      return;
    }
    this.analyticApiService.doEmitEventFormItself(
      this.flowId,
      this.businessId,
      this.paymentMethod,
      formName,
      status
    );
  }

  emitEventFormInit() {
    this.analyticApiService.doEmitEventFormInit(
      this.flowId,
      this.businessId,
    );
  }

  analyticReady(): boolean {
    return !!this.flowId && !!this.businessId && !this.editMode;
  }
}
