import { AfterViewInit, Directive, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { delay, filter, map, skipWhile, takeUntil, tap } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { FlowState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import {
  ANALYTICS_FORM_SETTINGS,
  AnalyticConsentEventEnum,
  AnalyticConsentStatusEnum,
  AnalyticsFormService,
  EventConsentInterface,
} from '../core';

interface EventDataInterface {
  action: AnalyticConsentEventEnum,
  value: AnalyticConsentStatusEnum,
}

@Directive({
  selector: '[analyticsConsent]',
  providers: [
    PeDestroyService,
  ],
})
export class AnalyticsConsentDirective implements AfterViewInit {
  private store = inject(Store);
  private ngControl = inject(NgControl, { self: true });
  private analyticsFormService = inject(AnalyticsFormService, { skipSelf: true, optional: true });
  private formSettings = inject(ANALYTICS_FORM_SETTINGS, { optional: true, skipSelf: true });
  private destroy$ = inject(PeDestroyService, { self: true });
  private trackingService = inject(TrackingService);

  @Input('analyticsConsent') eventName: AnalyticConsentEventEnum;

  ngAfterViewInit(): void {
    const valueChanges$ = this.ngControl.control.valueChanges.pipe(
      filter(() => this.ngControl.dirty),
      map(value => ({
        action: this.eventName,
        value: value? AnalyticConsentStatusEnum.SELECT : AnalyticConsentStatusEnum.DESELECT,
      })),
    );

    merge(
      valueChanges$,
    ).pipe(
      skipWhile(() => !this.analyticsFormService?.analyticReady() || !this.eventName),
      delay(100),
      map((event: EventDataInterface) => this.prepareEventData(event.action, event.value)),
      tap((eventData: EventConsentInterface) => {
        this.emitEventForm(eventData);

        if (eventData.value === AnalyticConsentStatusEnum.SELECT ) {
          const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
          const flowId = this.store.selectSnapshot(FlowState.flowId);

          this.trackingService.doEmitCustomEvent(flowId, paymentMethod, eventData.action);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private emitEventForm(eventForm: EventConsentInterface): void {
    this.analyticsFormService.emitEventForm(this.formSettings?.formName, eventForm);
  }

  private prepareEventData(type: AnalyticConsentEventEnum, value: AnalyticConsentStatusEnum): EventConsentInterface {
    return {
      action: type,
      value,
      paymentMethod: this.store.selectSnapshot(FlowState.paymentMethod),
    };
  }
}
