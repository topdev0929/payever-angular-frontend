import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import memoize from 'fast-memoize';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';

import { ChildrenFormValue, numberMaskFactory, numberUnmask } from '../../../../shared';

const MAX_CHILDREN_COUNT = 20;
const MAX_AGE = 100;

@Component({
  selector: 'children-form',
  templateUrl: './children-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildrenFormComponent extends CompositeForm<ChildrenFormValue> implements OnInit {

  public childrenArray = this.fb.array<FormGroup>([]);
  public formGroup = this.fb.group({
    _count: [
      null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(MAX_CHILDREN_COUNT),
      ],
    ],
    children: this.childrenArray,
  });

  get controlsArray(): FormGroup[] {
    return this.childrenArray.controls;
  }

  public readonly countUnmask = numberUnmask;
  public readonly countMask = numberMaskFactory(0, MAX_CHILDREN_COUNT);

  public readonly ageUnmask = numberUnmask;
  public readonly ageMask = numberMaskFactory(0, MAX_AGE);

  ngOnInit(): void {
    super.ngOnInit();

    const childrenCountChanges$ = this.formGroup.get('_count').valueChanges.pipe(
      startWith(this.formGroup.get('_count').value),
      tap((count: number) => {
        const validCount = Math.min(count, MAX_CHILDREN_COUNT);
        const currentCount = this.childrenArray.length;

        for (let i = validCount; i <= currentCount; i++) {
          this.childrenArray.removeAt(this.childrenArray.length - 1);
        }
        const alteredCount = this.childrenArray.length;
        if (alteredCount < validCount) {
          for (let i = alteredCount; i < validCount; i++) {
            this.createForm();
          }
        }
      }),
    );

    childrenCountChanges$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private translate(i: number) {
    return {
      age_of_child: $localize `:@@santander-dk.inquiry.form.age_of_child.label:${i}:index:`,
    };
  }

  public readonly translateMemo = memoize(this.translate.bind(this));

  public trackByIdx(index: number): number {
    return index;
  }

  private createForm(): void {
    this.childrenArray.push(this.fb.group({
      age: [null, [Validators.required, Validators.min(0), Validators.max(MAX_AGE)]],
    }));
  }
}
