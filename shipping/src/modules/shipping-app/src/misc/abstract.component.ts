import { Directive, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@pe/i18n-core';

@Directive()
export abstract class AbstractComponent implements OnDestroy {
  protected destroyed$ = new ReplaySubject<boolean>();
  protected constructor(protected translateService: TranslateService) {
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getConfirmationContent(dialog, action) {
    return {
      subject: this.translateService.translate(`shipping-app.dialog_leave.${dialog}`),
      title: this.translateService.translate(`shipping-app.dialog_leave.heading_${action}`),
      subtitle: this.translateService.translate(`shipping-app.dialog_leave.description_${action}`),
      subtitle1: this.translateService.translate('shipping-app.dialog_leave.description'),
    };
  }
}
