import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, merge, Subject } from 'rxjs';
import { catchError, map, scan, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { SaveProgressHelperService } from '@pe/checkout/core';
import { CouponsStateService } from '@pe/checkout/coupons';
import { FlowState, OpenNextStep } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

interface ViewModel {
  errorText: string;
  loading: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-coupons-edit-container',
  templateUrl: './coupons-edit-container.component.html',
  styleUrls: ['./coupons-edit-container.component.scss'],
  providers: [PeDestroyService],
})
export class CouponsEditContainerComponent implements OnInit, OnDestroy {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  private errorTextSubject$ = new Subject<string>();
  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  public vm$ = merge(
    this.errorTextSubject$.pipe(
      map(errorText => ({ errorText })),
    ),
    this.loadingSubject$.pipe(
      map(loading => ({ loading })),
    ),
  ).pipe(
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
  );

  public formGroup = this.fb.group({
    coupon: [this.flow.coupon],
  });

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private saveProgressHelperService: SaveProgressHelperService,
    private analyticsFormService: AnalyticsFormService,
    private couponStateService: CouponsStateService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.saveProgressHelperService.editting[this.flow.id] = true;
    this.saveProgressHelperService.trigger$.pipe(
      tap(() => this.onSubmit()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.saveProgressHelperService.editting[this.flow.id] = false;
  }

  onSkip(): void {
    this.store.dispatch(new OpenNextStep());
  }

  onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {

      this.loadingSubject$.next(true);
      (value ? this.couponStateService.updateCoupon(value.coupon) : this.couponStateService.removeCoupon()).pipe(
        catchError((err) => {
          const error = err.raw.error.message || err.raw.message || err.message;
          this.errorTextSubject$.next(error);
          this.loadingSubject$.next(false);

          return EMPTY;
        }),
        switchMap(() => {
          this.loadingSubject$.next(false);

          return this.store.dispatch(new OpenNextStep());
        }),
      ).subscribe();
    }
  }
}
