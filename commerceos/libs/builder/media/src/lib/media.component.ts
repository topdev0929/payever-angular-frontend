import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService, PeGridItem } from '@pe/common';
import { ClearStudioMedia, PopupMode, StudioAppState } from '@pe/shared/studio';

import { PebMediaDialogService } from './media-dialog.service';


@Component({
  selector: 'peb-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebMediaComponent implements OnInit, OnDestroy {
  @Select(StudioAppState.studioMediaItem) studioMediaItem$: Observable<PeGridItem>;

  constructor(
    private mediaService: PebMediaDialogService,
    private store: Store,
    private destroy: PeDestroyService,
  ) {
    this.studioMediaItem$
      .pipe(
        tap((mediaItem: PeGridItem) => {
          if (mediaItem) {
           this.mediaService.closeMediaDialog(mediaItem);
          }
        }),
        takeUntil(this.destroy),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(new PopupMode(true));
  }

  ngOnDestroy() {
    this.store.dispatch(new PopupMode(false));
    this.store.dispatch(new ClearStudioMedia());
  }

  close() {
    this.mediaService.closeMediaDialog(null);
  }
}
