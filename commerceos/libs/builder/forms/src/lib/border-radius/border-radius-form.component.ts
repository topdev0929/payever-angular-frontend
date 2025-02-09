import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { asyncScheduler, ReplaySubject } from 'rxjs';
import { observeOn, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebBorderRadiusFormService } from './border-radius-form.service';


@Component({
  selector: 'peb-border-radius-form',
  templateUrl: './border-radius-form.component.html',
  styleUrls: ['./border-radius-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebBorderRadiusForm {

  max$ = new ReplaySubject<number>(1);

  form = this.formBuilder.group({ borderRadius: 0 });

  constructor(
    private readonly borderRadiusFormService: PebBorderRadiusFormService,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.borderRadiusFormService.borderRadius$.pipe(
      tap(({ borderRadius, max }) => {
        if (borderRadius > max) {
          this.borderRadiusFormService.updateElements(max);
        }

        this.max$.next(max);
      }),
      observeOn(asyncScheduler),
      tap(({ borderRadius }) => {
        this.form.setValue({ borderRadius }, { emitEvent: false });
        this.form.markAsUntouched();
        this.form.markAsPristine();
      }),
      switchMap(() => this.form.valueChanges.pipe(
        tap(({ borderRadius }) => {
          this.borderRadiusFormService.updateView(borderRadius);
          if (this.form.touched) {
            this.borderRadiusFormService.updateElements(borderRadius);
            this.form.markAsUntouched();
            this.form.markAsPristine();
          }
        })
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
