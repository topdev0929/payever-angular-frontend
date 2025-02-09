import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { AppThemeEnum } from '@pe/common';

import { SearchOverlayComponent } from '../components/search-overlay/search-overlay.component';

@Injectable()
export class SearchOverlayService {
  overlayRef;
  searchText: string;
  theme = AppThemeEnum.default;
  constructor(private overlay: Overlay) {}

  open(searchText?: string): void {
    const searchPortal = new ComponentPortal(SearchOverlayComponent);
    this.searchText = searchText || '';

    const config = new OverlayConfig({
      panelClass: ['search-overlay', this.theme],
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-' + 'dark' + '-backdrop',
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(searchPortal);
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef.detach());
  }

  close(): void {
    this.overlayRef.detach();
  }
}
