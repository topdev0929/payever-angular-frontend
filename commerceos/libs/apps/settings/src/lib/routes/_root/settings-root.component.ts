import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { APP_TYPE, AppType, MessageBus, PeDestroyService } from '@pe/common';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { FolderItem } from '@pe/shared/folders';

import { SETTINGS_NAVIGATION, SidebarAnimationProgress } from '../../misc/constants';
import { BusinessEnvService } from '../../services';
import { SettingsRoutesEnum } from '../../settings-routes.enum';

const SIDENAV_NAME = 'app-settings-sidenav';

@Component({
  selector: 'peb-settings',
  templateUrl: './settings-root.component.html',
  styleUrls: ['./settings-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})

export class PebSettingsComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;

  selectedFolder: FolderItem = null;
  isMobile = document.body.clientWidth <= 720;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);
  sidebarLink;
  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData$: Observable<FolderItem[]> =
    this.envService.businessAccessOptions$.pipe(map(options => SETTINGS_NAVIGATION
    .filter(item => item.data.owners.includes(this.envService.ownerType)
      && !item.data.hideForUserTypes?.includes(options?.userTypeBusiness))
    .map(item => ({
      ...item,
      name: this.translateService.translate(item.name),
    }))));

  constructor(
    @Optional() @Inject(APP_TYPE) private entityName: AppType,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: BusinessEnvService,
    private cosEnvService: CosEnvService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private peGridSidenavService: PeGridSidenavService,
    private translateService: TranslateService,
    private headerService: PePlatformHeaderService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.messageBus.listen(`settings.toggle.sidebar`).pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      switchMap(() => {
        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        this.sidebarLink = segments[3]?.path;

        return this.treeData$;
      }),
      tap((tree) => {
        this.selectedFolder = tree.find(folder => folder.data.link === this.sidebarLink);
        this.mobileTitle$.next(this.selectedFolder?.name);
        this.showMobileTitle$.next(![
          SettingsRoutesEnum.Wallpaper,
          SettingsRoutesEnum.Employees,
        ].includes(this.sidebarLink as SettingsRoutesEnum));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    const url = this.cosEnvService.isPersonalMode
    ? `/personal/${this.envService.userAccount._id}`
    : `/business/${this.envService.businessUuid}`;
    if (this.isMobile){
      this.router.navigate([`${url}/settings/`]);
    }
    this.cdr.markForCheck();
  }

  navigateToLink(folder: FolderItem) {
    const url = this.cosEnvService.isPersonalMode
      ? `/personal/${this.envService.userAccount._id}`
      : `/business/${this.envService.businessUuid}`;

    this.sidebarLink !== folder.data.link
    && this.router.navigate([`${url}/settings/${folder.data.link}`]).then(() => {
      this.mobileTitle$.next(this.selectedFolder?.name);
    });
    this.messageBus.emit(`${this.entityName}.navigate.${folder._id}`, this.envService.businessId);
  }

  ngOnInit() {
    this.initTranslations();

    if (this.envService.businessId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`${this.entityName}.navigate.dashboard`, this.envService.businessId);
    }

    this.addSidenavItem();
    this.changeHeaderConfig(this.isMobile);

    merge(
      fromEvent(window, 'resize').pipe(
        tap(() => {
          const isMobile = window.innerWidth <= 720;

          if (isMobile !== this.isMobile) {
            this.isMobile = isMobile;
            this.changeHeaderConfig(isMobile);
          }
        }),
      ),
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((open: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, open);
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['settings-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['settings-app'], err);

        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private addSidenavItem(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('sidebar.title'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.toggleSidebar();
        },
      },
    });
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }
}
