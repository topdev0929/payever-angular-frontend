import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-backdrop-filter-form',
  templateUrl: './backdrop-filter-form.component.html',
  styleUrls: ['./backdrop-filter-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebBackdropFilterForm implements OnInit {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  backdropFilterForm = this.formBuilder.group({
    enabled: [false],
    value: [0],
  });

  defaultBackdropFilter = {
    enabled: false,
    value: 0,
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
  ) {
  }

  ngOnInit(): void {
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        const backdropFilter = element.styles.filter?.backBlur || this.defaultBackdropFilter;

        this.backdropFilterForm.markAsPristine();
        this.backdropFilterForm.patchValue(backdropFilter);
        this.cdr.detectChanges();
      }),
      switchMap(selected => this.backdropFilterForm.valueChanges.pipe(
        filter(() => this.backdropFilterForm.dirty),
        tap((backBlur) => {
          const payload = selected.map(element => ({ id: element.id, styles: { filter: { backBlur } } }));
          this.store.dispatch(new PebUpdateAction(payload));
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
