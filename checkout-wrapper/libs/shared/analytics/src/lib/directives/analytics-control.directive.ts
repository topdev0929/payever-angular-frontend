import { AfterViewInit, Directive, ElementRef, Input, inject } from '@angular/core';
import { FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { fromEvent, merge } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, skipWhile, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import {
  ANALYTICS_FORM_SETTINGS,
  AnalyticActionEnum,
  AnalyticsFormService,
  EventFormInterface,
} from '../core';

interface EventDataInterface {
  action: AnalyticActionEnum,
  errors?: ValidationErrors
}

@Directive({
  selector: '[formControl], [formControlName]',
  providers: [
    PeDestroyService,
  ],
})
export class AnalyticsControlDirective implements AfterViewInit {
  private ngControl = inject(NgControl, { self: true });
  private analyticsFormService = inject(AnalyticsFormService, { skipSelf: true, optional: true });
  private formSettings = inject(ANALYTICS_FORM_SETTINGS, { optional: true, skipSelf: true });
  private matFormField = inject(MAT_FORM_FIELD, { optional: true, skipSelf: true });
  private elementRef = inject(ElementRef, { self: true });
  private destroy$ = inject(PeDestroyService, { self: true });
  private formGroupDirective = inject(FormGroupDirective, { skipSelf: true });

  @Input() analyticFieldName: string;
  @Input() formControlName: string | number;

  ngAfterViewInit(): void {
    const focus$ = fromEvent<EventDataInterface>(this.elementRef.nativeElement, 'focus').pipe(
      map(() => ({
        action: AnalyticActionEnum.FOCUS,
      }))
    );

    const blur$ = fromEvent<EventDataInterface>(this.elementRef.nativeElement, 'blur').pipe(
      map(() => ({
        action: AnalyticActionEnum.BLUR,
      }))
    );

    const valueChanges$ = this.ngControl.control.valueChanges.pipe(
      filter(() => this.ngControl.dirty),
      map(() => ({
        action: AnalyticActionEnum.CHANGE,
        errors: this.ngControl.control.errors,
      })),
    );

    const ngSubmit$ = this.formGroupDirective.ngSubmit.pipe(
      filter(() => !this.ngControl.control.valid),
      map(() => ({
        action: AnalyticActionEnum.CHANGE,
        errors: this.ngControl.control.errors,
      }))
    );

    merge(
      focus$,
      blur$,
      valueChanges$,
      ngSubmit$
    ).pipe(
      skipWhile(() => !this.analyticsFormService?.analyticReady() || !this.formSettings?.formName),
      delay(100),
      map((event: EventDataInterface) => this.prepareEventData(event.action, event?.errors)),
      distinctUntilChanged((v1, v2) => v1.action === v2.action && v1?.validationError === v2.validationError),
      tap((eventData: EventFormInterface) => {
        this.emitEventForm(eventData);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private emitEventForm(eventForm: EventFormInterface): void {
    this.analyticsFormService.emitEventForm(this.formSettings.formName, eventForm);
  }

  private prepareEventData(type: AnalyticActionEnum, errors?: ValidationErrors): EventFormInterface {
    return {
      field: this.getFieldName(),
      action: type,
      form: this.formSettings.formName,
      ...errors && this.errorText() ? {
        validationError: this.errorText(),
        validationTriggered: true,
      }
      : {},
    };
  }

  private errorText(): string {
    const errorElement = this.matFormField?._elementRef?.nativeElement?.querySelector('pe-error > mat-error');

    return errorElement?.innerText;
  }

  private getFieldName(): string {
    return this.analyticFieldName
      ?? (this.matFormField?.['_label'] as ElementRef)?.nativeElement?.innerText
      ?? String(this.formControlName);
  }
}
