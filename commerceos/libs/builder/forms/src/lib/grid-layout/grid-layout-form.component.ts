import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebGridLayoutService } from './grid-layout.service';


@Component({
  selector: 'peb-grid-layout-form',
  templateUrl: './grid-layout-form.component.html',
  styleUrls: ['./grid-layout-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebGridLayoutFormComponent {

  form = new FormGroup({
    cols: new FormControl(1),
    rows: new FormControl(1),
  });

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly layoutService: PebGridLayoutService,
  ) {
    this.layoutService.layout$.pipe(
      tap((value) => {
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.setValue(value, { emitEvent: false });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.form.valueChanges.pipe(
      filter(() => this.form.dirty && this.form.touched),
      tap((value) => {
        this.layoutService.updateLayout(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
