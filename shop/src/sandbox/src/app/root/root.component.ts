import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Portal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'rxjs';

import { MessageBus, PeDestroyService } from '@pe/common';
import {PEB_SHOP_HOST} from '@pe/builder-shop';

import { SandboxSettingsService } from '../shared/settings/settings.service';
import { SandboxViewerSelectionDialog } from './dialogs/viewer-selection.dialog';
import { globalPalette } from '../../styles/palette';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  providers: [PeDestroyService],
})
export class SandboxRootComponent implements OnInit {
  customToolsPortal: Portal<any> = null;
  theme = 'dark'

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(PEB_SHOP_HOST) private shopHost: string,
    private destroy$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    this.setGlobalPalette();
    merge(
      this.messageBus.listen(`${this.entityName}.navigate.dashboard`).pipe(
        tap((shopId: string) => this.router.navigate([`/shop/${shopId}/dashboard`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.themes`).pipe(
        tap((shopId: string) => this.router.navigate([`/shop/${shopId}/themes`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings`).pipe(
        tap((shopId: string) => this.router.navigate([`/shop/${shopId}/settings`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.edit`).pipe(
        tap((shopId: string) => this.router.navigate([`/shop/${shopId}/edit`])),
      ),
      this.messageBus.listen(`${this.entityName}.open`).pipe(
        filter((shop: any) => !!shop?.accessConfig?.internalDomain),
        tap((shop: any) => window.open(`https://${shop.accessConfig.internalDomain}.${this.shopHost}`, '_blank')),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  @HostBinding('class.front-page')
  get classFrontPage() {
    return this.router.url === '/';
  }

  openSettings() {
    this.settingsService.open();
  }

  openViewerDialog() {
    this.dialog.open(SandboxViewerSelectionDialog, {
      backdropClass: 'sandbox-dialog-backdrop',
      panelClass: 'sandbox-dialog-panel',
    });
  }
  toggle(){
    this.messageBus.emit('header.view.click',null)
    // this.sidebarService.toggleSidebar()
  }

  setGlobalPalette() {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;
    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--'+key, value);
    })
  }
}
