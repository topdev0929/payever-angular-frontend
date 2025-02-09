import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface } from '@pe/business';
import { BusinessState } from '@pe/user';

@Injectable()
export class SearchOverlayService {
    @SelectSnapshot(BusinessState.businessData) businessData:BusinessInterface
    overlayRef
    searchText: string;
    constructor(
        private overlay: Overlay,
    ) {
    }

    open(component, searchText?: string) {

        const searchPortal = new ComponentPortal(component);
        this.searchText = searchText||'';

        let config = new OverlayConfig({
            panelClass: ['search-overlay'],
            hasBackdrop: true,
            backdropClass: ['cdk-overlay-backdrop', 'pe-overlay-widget-backdrop'],
            disposeOnNavigation: true,
        });
        this.overlayRef = this.overlay.create(config);
        this.overlayRef.attach(searchPortal);
        this.overlayRef.backdropClick().subscribe(() => this.overlayRef.detach());
    }

    close(){
        this.overlayRef.detach();
    }
}
