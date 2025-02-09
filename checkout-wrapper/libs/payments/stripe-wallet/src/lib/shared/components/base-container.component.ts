import {
  OnInit,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
} from '@pe/checkout/types';

import { StripeApiService } from '../services';

@Directive()
export class BaseContainerComponent extends AbstractContainerComponent implements OnInit {
  errors: ErrorInterface;

  @Input() allowBrowserCard: boolean;

  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter();

  isFinishModalShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  protected apiService = this.injector.get(ApiService);
  protected nodeApiService = this.injector.get(NodeApiService);
  protected stripeApiService = this.injector.get(StripeApiService);

  ngOnInit(): void {
    this.isFinishModalShown$.pipe(
      tap(value => this.finishModalShown.emit(value)),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
