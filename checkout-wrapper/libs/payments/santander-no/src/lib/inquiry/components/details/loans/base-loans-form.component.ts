import { Directive, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

const MAX_LOANS_COUNT = 20;

interface BaseLoansFormValue<T = any> {
  _count: number;
  loans: T[];
}

@Directive({
  providers: [PeDestroyService],
})
export abstract class BaseLoansFormComponent extends CompositeForm<BaseLoansFormValue> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  public currency = this.flow.currency;

  protected loansForm = this.fb.array<FormGroup>([]);
  public formGroup = this.fb.group({
    _count: this.fb.control<number>(null, [Validators.required, Validators.min(0), Validators.max(MAX_LOANS_COUNT)]),
    loans: this.loansForm,
  });

  public get loansArray(): FormGroup[] {
    return this.loansForm.controls as FormGroup[];
  }

  public readonly maxMaskFn = (value: string) => value ? Math.min(MAX_LOANS_COUNT, Number(value)).toString() : value;

  protected abstract createForm(): void;

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.get('_count').valueChanges.pipe(
      tap((count) => {
        const validCount = Math.min(count, MAX_LOANS_COUNT);
        const currentCount = this.loansArray.length;

        for (let i = validCount; i <= currentCount; i++) {
          this.loansForm.removeAt(this.loansArray.length - 1);
        }
        const alteredCount = this.loansArray.length;
        if (alteredCount < validCount) {
          for (let i = alteredCount; i < validCount; i++) {
            this.createForm();
          }
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  writeValue(obj: any): void {
    this.formGroup.get('loans').patchValue(obj);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.formGroup.get('loans').valueChanges.pipe(
      tap((value) => {
        this.onTouch?.();
        fn(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public trackByIdx(index: number): number {
    return index;
  }
}
