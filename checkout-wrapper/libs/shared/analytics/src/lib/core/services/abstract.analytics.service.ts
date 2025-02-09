import { Injectable } from '@angular/core';

import { AnalyticFormStatusEnum, EventConsentInterface, EventFormInterface } from '../models';

@Injectable()
export abstract class AnalyticsFormService {
  abstract flowId: string;
  abstract paymentMethod: string;
  abstract businessId: string;
  abstract editMode: boolean;

  abstract initAnalyticForm(flowId: string, businessId: string): void;
  abstract initPaymentMethod(paymentMethod: string): void;
  abstract initEditMode(editMode: boolean): void;
  abstract emitEventForm(formName: string, eventForm: EventFormInterface | EventConsentInterface): void;
  abstract emitEventFormItself(formName: string, status: AnalyticFormStatusEnum): void;
  abstract emitEventFormInit(): void;
  abstract analyticReady(): boolean;
}
