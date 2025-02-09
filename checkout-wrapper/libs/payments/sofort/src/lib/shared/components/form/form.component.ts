import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sofort-shared-form',
  templateUrl: './form.component.html',
  providers: [PeDestroyService],
})
export class FormComponent {
  @Input() set doSubmit$(doSubmit$: Subject<null | void>) {
    if (this.doSubmitSubscription) {
      this.doSubmitSubscription.unsubscribe();
    }

    this.doSubmitSubscription = doSubmit$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.doSubmit());
  }

  @Input() errors: string[];

  @Output() submitted: EventEmitter<object> = new EventEmitter();

  constructor(private destroy$: PeDestroyService) {}

  protected doSubmitSubscription: Subscription;

  protected doSubmit(): void {
    this.submitted.emit({});
  }
}
