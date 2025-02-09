import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Portal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'rxjs';

import { PEB_POS_HOST } from '@pe/builder-pos';
import { MessageBus, PeDestroyService } from '@pe/common';

import { SandboxSettingsService } from '../shared/settings/settings.service';
import { SandboxViewerSelectionDialog } from './dialogs/viewer-selection.dialog';
import { globalPalette } from '../../styles/palette';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  providers: [ PeDestroyService ],
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
    @Inject(PEB_POS_HOST) private posHost: string,
    private destroy$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    this.setGlobalPalette();
    merge(
      this.messageBus.listen(`${this.entityName}.navigate.dashboard`).pipe(
        tap((posId: string) => this.router.navigate([`/pos/${posId}/dashboard`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.connect`).pipe(
        tap((posId: string) => this.router.navigate([`/pos/${posId}/connect`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings`).pipe(
        tap((posId: string) => this.router.navigate([`/pos/${posId}/settings`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings_edit`).pipe(
        tap((posId: string) => this.router.navigate([`/pos/${posId}/settings`], { queryParams: { isEdit: true } })),
      ),
      this.messageBus.listen(`${this.entityName}.open`).pipe(
        filter((terminal: any) => !!terminal?.name),
        tap((terminal: any) => window.open(`https://${terminal?.accessConfig?.internalDomain}.${this.posHost}`, '_blank')),
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
console.log(globalPalette)
    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--'+key, value);
    })
  }
}
