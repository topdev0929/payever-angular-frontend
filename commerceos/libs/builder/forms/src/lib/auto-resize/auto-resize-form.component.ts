import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { concat, Observable } from 'rxjs';
import { filter, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { isSyncEnabled } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState, PebSyncAction, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-auto-resize-form',
  templateUrl: './auto-resize-form.component.html',
  styleUrls: ['./auto-resize-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebAutoResizeForm implements OnInit {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  form = this.formBuilder.group({ synced: true, resizeText: true, resizeChildren: false });
  screenKey = '';

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
  ) {
    this.screen$.pipe(
      tap(scr => this.screenKey = scr.key),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      withLatestFrom(this.screen$),
      tap(([[element], screen]) => {
        const synced = isSyncEnabled(element, screen.key);
        this.form.markAsPristine();
        this.form.patchValue({ ...element.data?.resizeSetting, synced });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.form.valueChanges.pipe(
      filter(() => this.form.dirty),
      tap(autoResize => this.applyChanges(autoResize)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  applyChanges(value) {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = selected.map(elm =>
    ({
      id: elm.id, data: {
        resizeSetting: {
          ...elm.data.resizeSetting,
          resizeText: value.resizeText,
          resizeChildren: value.resizeChildren,
        },
        syncSizePosition: { [this.screenKey]: value.synced },
      },
    }));

    concat(
      this.store.dispatch(new PebUpdateAction(payload)),
      this.store.dispatch(new PebSyncAction(selected, { position: true })),
    ).subscribe();
  }
}
