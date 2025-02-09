import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import { map, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { PebEditorViewport, PEB_EDITOR_MAX_ZOOM, PEB_EDITOR_MIN_ZOOM } from '@pe/builder/core';
import { PebEditorState, PebOptionsState, PebSetScaleAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-zoom-dialog',
  templateUrl: './zoom-dialog.component.html',
  styleUrls: ['./zoom-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebZoomDialogComponent {
  minZoom = PEB_EDITOR_MIN_ZOOM * 100;
  maxZoom = PEB_EDITOR_MAX_ZOOM * 100;

  @Select(PebEditorState.viewport) viewport$!: Observable<PebEditorViewport>;
  @Select(PebOptionsState.scaleToFit) toFit$!: Observable<boolean>;

  zoomLevels$ = this.viewport$.pipe(
    map(({ scale }) => {
      return [50, 100, 200, 400, 800].map(value => ({ value, active: value === scale * 100 }));
    }),
  );

  formGroup = new FormGroup({
    zoom: new FormControl(100),
  });

  constructor(
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ){
    this.viewport$.pipe(
      tap(({ scale }) => {
        this.formGroup.get('zoom')?.patchValue(scale * 100, { emitEvent: false });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.formGroup.get('zoom')?.valueChanges.pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      tap((scale) => {
        this.store.dispatch(new PebSetScaleAction({ scale: scale / 100 }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  setZoom(value: number) {
    this.formGroup.get('zoom')?.patchValue(value);
    this.store.dispatch(new PebSetScaleAction({ scale: value / 100 }));
  }

  fitToScale() {
    this.store.dispatch(new PebSetScaleAction({ scaleToFit: true }));
  }
}
