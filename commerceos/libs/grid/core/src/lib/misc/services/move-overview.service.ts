import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { MoveIntoFolderEvent, PeFoldersModule } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { FolderItem } from '@pe/shared/folders';

import { PeGridService } from '../../grid.service';
import { PeGridMoveOverviewComponent } from '../components/move-overview/move-overview';

@Injectable()
export class PeMoveOverviewService {
  selectFolder$ = new Subject<MoveIntoFolderEvent>();

  private save$ = new BehaviorSubject<FolderItem>(null);

  constructor(
    private overlay: PeOverlayWidgetService,
    public injector: Injector,
    private translateService: TranslateService,
    private gridService: PeGridService
  ) {}

  openOverview(): void {
    const overlayData = {
      selectedItems: this.gridService.selectedItems,
      selectFolder$: this.selectFolder$,
      save$: this.save$,
    };
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: PeGridMoveOverviewComponent,
      data: { ...overlayData },
      backdropClass: 'move_overlay-backdrop',
      panelClass: `move_overlay-panel`,

      headerConfig: {
        title: 'Move',
        backBtnTitle: this.translateService.translate('grid.actions.cancel'),
        backBtnCallback: () => {
          this.overlay.close();
        },
        doneBtnTitle: this.translateService.translate('grid.actions.done'),
        doneBtnCallback: () => {
          this.doneAction();
        },
        removeContentPadding: true,
      },
      lazyLoadedModule: PeFoldersModule,
    };

    this.overlay.open(config);
  }

  private doneAction(): void {
    this.selectFolder$.next({
      folder: this.save$.value,
      moveItems: this.gridService.selectedItems,
    });
    this.overlay.close();

  }
}
