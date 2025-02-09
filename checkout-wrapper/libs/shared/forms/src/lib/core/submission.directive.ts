import { ChangeDetectorRef, Directive, OnDestroy, OnInit, Optional, Self, SkipSelf } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[formGroup]',
})
export class PeFormGroupSubmissionDirective implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    @SkipSelf() @Optional() private parentFormGroupDirective: FormGroupDirective,
    @Self() private formGroupDirective: FormGroupDirective,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    if (this.parentFormGroupDirective) {
      this.parentFormGroupDirective.ngSubmit.pipe(
        tap(() => {
          this.formGroupDirective.ngSubmit.emit();
          this.formGroupDirective.onSubmit(null);
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }
}
