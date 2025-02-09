import { Portal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, MessageBus } from '@pe/common';

import { globalPalette } from '../../styles/palette';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { SandboxSettingsService } from '../shared/settings/settings.service';
import { merge } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { InvoiceEnvService } from 'src/modules/invoice/src';

enum ThemesIcons {
  'button-close' = 'tools/close-button.svg',
  'alert-icon' = 'alert.svg',
  'image-placeholder' = 'image-placeholder.svg',
  'add-theme' = 'add-theme.svg',
  'delete' = 'delete.svg',
}
@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  customToolsPortal: Portal<any> = null;

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private elementRef: ElementRef
  ) {
    super();
      Object.entries(ThemesIcons).forEach(([name, path]) => {
        iconRegistry.addSvgIcon(
          name,
          domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
        );
      });

  }

  @HostBinding('class.front-page')
  get classFrontPage(): boolean {
    return this.router.url === '/';
  }

  ngOnInit(): void {
    this.setGlobalPalette();

    // TODO: move to service
    this.messageBus.listen('campaign.create').pipe(
      tap(() => this.router.navigate(['/invoice/create'])),
      takeUntil(this.destroyed$)
    ).subscribe();

    merge(
      this.messageBus.listen(`invoice.navigate.dashboard`).pipe(
        tap((invoiceId: string) => this.router.navigate([`/invoice/dashboard`])),
      ),
      this.messageBus.listen(`invoice.navigate.themes`).pipe(
        tap((invoiceId: string) => this.router.navigate([`/invoice/themes`])),
      ),
      this.messageBus.listen(`invoice.navigate.list`).pipe(
        tap((invoiceId: string) => this.router.navigate([`/invoice`])),
      ),
      this.messageBus.listen(`invoice.navigate.edit`).pipe(
        tap((invoiceId: string) => this.router.navigate([`/invoice/${invoiceId}/edit`])),
      ),
      this.messageBus.listen(`invoice.navigate.settings`).pipe(
        tap((invoiceId: string) => this.router.navigate([`/invoice/settings`])),
      ),
      this.messageBus.listen(`invoice.theme.open`).pipe(
        tap((themeId: any) => {
          if (themeId) {
            this.router.navigate([`/invoice/builder/${themeId}/edit`]);
            return
          }
          this.router.navigate([`/invoice/edit`])
        })),
      // this.messageBus.listen(`invoice.open`).pipe(
      //   filter((shopId: any) => !!shopId?.name),
      //   tap((shop: any) => window.open(`https://${shop.name}.${this.siteHost}`, '_blank')),
      // ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  openSettings(): void {
    this.settingsService.open();
  }

  openViewerDialog(): void {
    // this.dialog.open(SandboxViewerSelectionDialog, {
    //   backdropClass: 'sandbox-dialog-backdrop',
    //   panelClass: 'sandbox-dialog-panel',
    // });
  }

  setGlobalPalette(): void {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;

    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--' + key, value);
    });
  }
}
