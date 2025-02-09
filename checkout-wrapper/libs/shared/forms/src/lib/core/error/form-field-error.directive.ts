import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import { FormGroupDirective, NgControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { FormFieldErrorComponent } from './form-field-error.component';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: `
    input[formControl],
    input[formControlName],
    mat-select[formControl],
    mat-select[formControlName],
    `,
  standalone: true,
})
export class FormFieldErrorDirective implements AfterViewInit, OnDestroy {
  @Input() peNoError: boolean;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Optional() private input: MatInput,
    @Optional() private select: MatSelect,
    private elRef: ElementRef<HTMLInputElement | HTMLElement>,
    private ngControl: NgControl,
    private viewContainerRef: ViewContainerRef,
    private formGroupDirective: FormGroupDirective,
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (this.peNoError) {
      return;
    }
    const compRef = this.viewContainerRef.createComponent(FormFieldErrorComponent);
    const labelElement = this.elRef.nativeElement.parentElement.querySelector('label');
    compRef.instance.getErrorState = () => this.getErrorState();

    this.ngControl.statusChanges.pipe(
      startWith(this.ngControl.value),
      tap(() => {
        const label = labelElement?.textContent?.replace(/\*/g, '');
        compRef.instance.label = label ?? this.ngControl.name?.toString();
        compRef.instance.fromControl = this.ngControl.control;
        if (this.ngControl.invalid && (this.ngControl.touched
          || this.ngControl.dirty
          || this.formGroupDirective.submitted)) {
          compRef.instance.cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getErrorState() {
    const host = this.input || this.select;

    return host?.errorState;
  }
}
