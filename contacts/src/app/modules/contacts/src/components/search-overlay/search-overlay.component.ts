import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { AppThemeEnum } from '@pe/common';

import { SearchOverlayService } from '../../services/search-overlay.service';
import { SearchGroup } from '../../interfaces';

@Component({
  selector: 'pe-search-overlay',
  templateUrl: 'search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss'],
})
export class SearchOverlayComponent {
  hasValue: boolean;
  emptySearch: boolean = true;
  searchText = '';
  groups: SearchGroup[] = [];
  isLoading$: Subject<boolean> = new Subject();
  theme = AppThemeEnum.default;
  installedApps;

  constructor(
    private searchOverlayService: SearchOverlayService,
  ) {
    this.searchText = this.searchOverlayService.searchText;
    if (this.searchText) {
      this.onSearch(this.searchText);
    }
  }

  public onSearch(value: string): void {
  }

  close(): void {
    this.searchOverlayService.close();
  }

  openApp(app): void {
  }
}
