import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebOverflowMode } from '@pe/builder/core';
import { getDefaultOverflow, PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-overflow-form',
  templateUrl: './overflow-form.component.html',
  styleUrls: ['./overflow-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebOverflowForm implements OnInit {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  clipContentForm = this.formBuilder.group({
    enabled: [false],
  });

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
  ) {
  }

  ngOnInit(): void {
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        const overflow = element.styles.overflow ?? getDefaultOverflow(element.type, element.parent?.type);
        const clipping = overflow === PebOverflowMode.Hidden;

        this.clipContentForm.patchValue({ enabled: clipping }, { emitEvent: false });
      }),
      switchMap(selected => this.clipContentForm.valueChanges.pipe(
        tap((value) => {
          const overflow = value.enabled ? PebOverflowMode.Hidden : PebOverflowMode.Visible;
  
          const payload = selected.map(element => ({
            id: element.id,
            styles: { overflow },
          }));
          this.store.dispatch(new PebUpdateAction(payload));
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
