import { Directive, HostBinding, OnInit } from '@angular/core';
import { FormGroupDirective, NgControl } from '@angular/forms';
import { merge } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';


@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: `
    mat-checkbox[formControl],
    mat-checkbox[formControlName],
    `,
  standalone: true,
  providers: [
    PeDestroyService,
  ],
})
export class CheckboxErrorDirective implements OnInit {
  constructor(
    private ngControl: NgControl,
    private formGroupDirective: FormGroupDirective,
    private destroy$: PeDestroyService,
  ) { }

  @HostBinding('class.mat-checkbox-error')
  invalid = false;

  ngOnInit(): void {
    merge(
      this.formGroupDirective.ngSubmit,
      this.ngControl.valueChanges,
    ).pipe(
      map(() => this.ngControl.invalid && this.formGroupDirective.submitted),
      tap(invalid => this.invalid = invalid),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
