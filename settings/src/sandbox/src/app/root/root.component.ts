import { Portal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageBus } from '@pe/common';
import { PEB_SHOP_HOST } from '@pe/settings';
import { merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { globalPalette } from '../../styles/palette';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { SandboxSettingsService } from '../shared/settings/settings.service';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  customToolsPortal: Portal<any> = null;
  theme = 'white';

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(PEB_SHOP_HOST) private shopHost: string,
  ) {
    super();
  }

  ngOnInit() {
    this.setGlobalPalette();
    // ToDo: SETF-368: update regarding settings app
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
        filter((shopId: any) => !!shopId?.name),
        tap((shop: any) => window.open(`https://${shop.name}.${this.shopHost}`, '_blank')),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  @HostBinding('class.front-page')
  get classFrontPage() {
    return this.router.url === '/';
  }

  openSettings() {
    this.settingsService.open();
  }

  toggle() {
    this.messageBus.emit('header.view.click', null);
  }

  setGlobalPalette() {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;
    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--' + key, value);
    });
  }
}
