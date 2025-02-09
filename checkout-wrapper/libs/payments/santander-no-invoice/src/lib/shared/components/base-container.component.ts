import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { ErrorInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';


@Directive()
export class BaseContainerComponent
  extends AbstractPaymentContainerComponent
  implements AfterViewInit
{
  errors: ErrorInterface;

  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter();

  isFinishModalShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  protected env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected nodeApiService: NodeApiService = this.injector.get(NodeApiService);

  ngAfterViewInit(): void {
    this.onServiceReady.emit(true);
    this.isFinishModalShown$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.finishModalShown.emit(value));
  }
}
