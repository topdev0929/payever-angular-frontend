import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebOpacityFormService } from './opacity-form.service';

@Component({
  selector: 'peb-opacity-form',
  templateUrl: './opacity-form.component.html',
  styleUrls: [
    './opacity-form.component.scss',
    '../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebOpacityFormComponent {

  form = this.formBuilder.group({ opacity: 100 });

  constructor(
    public readonly opacityService: PebOpacityFormService,
    private readonly formBuilder: FormBuilder,
    private readonly destroy$: PeDestroyService,
  ) {
    this.opacityService.opacity$.pipe(
      tap((opacity) => {
        this.form.setValue({ opacity }, { emitEvent: false });
        this.form.markAsUntouched();
        this.form.markAsPristine();
      }),
      switchMap(() => this.form.valueChanges.pipe(
        tap((value) => {
          const opacity = value.opacity / 100;
          this.opacityService.updateView(opacity);
          if (this.form.touched) {
            this.opacityService.updateElements(opacity);
            this.form.markAsUntouched();
            this.form.markAsPristine();
          }
        })
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

}
