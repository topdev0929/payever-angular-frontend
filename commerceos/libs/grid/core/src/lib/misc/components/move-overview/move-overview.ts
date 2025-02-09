import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { FolderItem } from '@pe/shared/folders';

import { PeGridItem } from '../../interfaces';

@Component({
  selector: 'pe-grid-move-overview',
  templateUrl: './move-overview.html',
  styleUrls: ['./move-overview.scss'],
})

export class PeGridMoveOverviewComponent implements OnInit {
  selectedItems: PeGridItem[] = [];

  get item(): PeGridItem {
    return this.selectedItems[0] ?? null;
  }

  get titles(): string {
    return this.selectedItems.reduce((acc, item) => [...acc, item.title], []).join(', ');
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) private overlayData: {
      selectedItems: PeGridItem[];
      save$: Subject<FolderItem>,
    },
  ) {

  };

  onSelectFolder(folder: FolderItem): void {
    this.overlayData.save$.next(folder);
  }

  ngOnInit(): void {
    this.selectedItems = this.overlayData.selectedItems;
  }

}
