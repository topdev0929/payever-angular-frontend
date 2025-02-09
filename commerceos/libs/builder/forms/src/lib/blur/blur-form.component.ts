import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-blur-form',
  templateUrl: './blur-form.component.html',
  styleUrls: ['./blur-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebBlurForm implements OnInit {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  blurForm = this.formBuilder.group({
    enabled: [false],
    value: [0],
  });

  defaultBlur = {
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
        const blur = element.styles.filter?.blur || this.defaultBlur;

        this.blurForm.markAsPristine();
        this.blurForm.patchValue(blur);
        this.cdr.detectChanges();
      }),
      switchMap(selected => this.blurForm.valueChanges.pipe(
        filter(() => this.blurForm.dirty),
        tap((blur) => {
          const payload = selected.map(element => ({
            id: element.id,
            styles: { filter: { blur } },
          }));
          this.store.dispatch(new PebUpdateAction(payload));
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
