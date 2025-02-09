import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { PeDataGridSidebarService } from '@pe/data-grid';

import { globalPalette } from '../../styles/palette';
import { SandboxSettingsService } from '../shared/settings/settings.service';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { ICONS } from '../../dev/icons';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  patchedElements: NodeListOf<HTMLElement> = null;

  isMobile = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private elementRef: ElementRef,
    private dataGridSidebarService: PeDataGridSidebarService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private envService: EnvService,
  ) {
    super();

    this.listenToggleSidebar();
    this.registerIcons();
  }

  private listenToggleSidebar() {
    this.messageBus
      .listen('coupons.toggle.sidebar')
      .pipe(
        tap(() => this.onCloseButtonClick()),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnInit() {
    this.setGlobalPalette();

    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );

    // TODO: move to service
    this.messageBus
      .listen('campaign.create')
      .pipe(
        tap(() => this.router.navigate(['/coupons/create'])),
        takeUntil(this.destroyed$),
      )
      .subscribe();


    this.listenToggleSidebar();
  }

  @HostBinding('class.front-page')
  get classFrontPage() {
    return this.router.url === '/';
  }

  openSettings() {
    this.settingsService.open();
  }

  onCloseButtonClick() {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  setGlobalPalette() {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;

    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--' + key, value);
    });
  }

  registerIcons() {
    ICONS.map((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/${icon}-icon.svg`),
      );
    });
  }
}
