import {
  Component, ChangeDetectionStrategy, Input, EventEmitter, Output, ChangeDetectorRef
} from '@angular/core';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AbstractComponent } from '../../../../../../../../../kit/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'test-custom-element-container',
  templateUrl: './test-custom-element-container.component.html',
  styleUrls: ['./test-custom-element-container.component.scss']
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class TestCustomElementContainerComponent extends AbstractComponent {
  @Input() set submitForm$(emitter: EventEmitter<void>) {
    if (this.submitFormSub) this.submitFormSub.unsubscribe();
    this.submitFormSub = emitter.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.message$.next('Submitted!');
      timer(2000).subscribe(() => {
        this.message$.next('');
        this.cdr.detectChanges();
      });
    });
  }

  @Input() set payForOrder$(emitter: EventEmitter<any>) {
    if (this.payForOrderSub) this.payForOrderSub.unsubscribe();
    this.payForOrderSub = emitter.pipe(takeUntil(this.destroyed$)).subscribe((data: any) => {
      this.message$.next(`Paid! ${JSON.stringify(data)}`);
      timer(2000).subscribe(() => {
        this.message$.next('');
        this.cdr.detectChanges();
      });
    });
  }

  @Input() valueBoolean: boolean = false;
  @Input() valueNumber: number = 0;
  @Input() valueString: string = '';
  @Input() valueObject: {} = {};

  @Output('saved') saved: EventEmitter<{}> = new EventEmitter();

  message$: BehaviorSubject<string> = new BehaviorSubject('');

  private submitFormSub: Subscription = null;
  private payForOrderSub: Subscription = null;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  onSaved(): void {
    this.saved.next(this.valueObject);
  }
}
