import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AbstractFinishComponent } from '@pe/checkout/finish';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-inquiry-finish',
  templateUrl: './finish.component.html',
})
export class FinishComponent extends AbstractFinishComponent {

  @Input() isPOS: boolean;

  get signingCenterLink(): string {
    return null;
  }

  failedTitle$(): Observable<string> {
    return of(
      this.isPOS
        ? $localize `:@@santander-de-fact-pos.inquiry.finish.application_fail.title:`
        : $localize `:@@inquiry.finish.application_fail.title:`
    );
  }
}
