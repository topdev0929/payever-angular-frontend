import { Directive, OnDestroy, OnInit, inject } from '@angular/core';

import {
  ANALYTICS_FORM_SETTINGS,
  AnalyticFormStatusEnum,
  AnalyticsFormService,
} from '../core';

@Directive({
  selector: 'form[analyticsForm]',
})
export class AnalyticsFormDirective implements OnInit, OnDestroy {
  private formSettings = inject(ANALYTICS_FORM_SETTINGS, { skipSelf: true, optional: true });

  private analyticsFormService = inject(AnalyticsFormService, { skipSelf: true, optional: true });

  ngOnInit(): void {
    if (!this.analyticsFormService?.analyticReady()) {
      return;
    }

    this.analyticsFormService?.emitEventFormItself(this.formSettings.formName, AnalyticFormStatusEnum.OPEN);
  }

  ngOnDestroy(): void {
    if (!this.analyticsFormService?.analyticReady()) {
      return;
    }

    this.analyticsFormService?.emitEventFormItself(this.formSettings.formName, AnalyticFormStatusEnum.CLOSED);
  }
}
