import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { BackgroundActivityService } from '@pe/builder/background-activity';
import { PebEditorPublishDialogComponent } from '@pe/builder/publishing';
import { PebEditorState, PebSetSidebarsAction, PebSidebarsState, PebSidebarsStateModel } from '@pe/builder/state';
import { PeBuilderShareService } from '@pe/builder-share';
import { BusinessInterface } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';
import { BusinessState } from '@pe/user';

import { PeShopBuilderEditComponent } from './builder-edit/builder-edit.component';
import { PebShopBuilderInsertComponent } from './builder-insert/builder-insert.component';
import { PeShopBuilderIntegrationComponent } from './builder-integration/builder-integration.component';
import { PeShopBuilderThemeComponent } from './builder-theme/builder-theme.component';
import { PebShopBuilderViewComponent } from './builder-view';
import { PeHeaderService } from './header.service';

const MAX_MOBILE_SIZE = 720;

@Component({
  selector: 'pe-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  providers: [
    MatDialog,
    PeDestroyService,
    BackgroundActivityService,
  ],
})
export class PeHeaderComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData!: BusinessInterface;
  @Select(PebSidebarsState.sidebars) sidebars$!: Observable<PebSidebarsStateModel>;
  @Select(PebEditorState.publishedVersion) publishedVersion$!: Observable<number | null>;

  isMobile = window.innerWidth <= MAX_MOBILE_SIZE;
  isBuilderPage: boolean;

  private readonly resize$ = fromEvent(window, 'resize').pipe(
    map(() => window.innerWidth <= MAX_MOBILE_SIZE),
    distinctUntilChanged(),
    tap(isMobile => this.isMobile = isMobile),
  );

  private readonly configChanged$ = this.platformHeaderService.config$.pipe(
    filter(config => config !== null),
    take(1),
    filter(() => this.isBuilderPage),
  );

  private readonly navigationEnd$ = this.router.events.pipe(
    filter(routerEvent => routerEvent instanceof NavigationEnd),
    tap((routerEvent: any) => this.isBuilderPage = routerEvent.url.includes('/edit'))
  );

  constructor(
    private dialog: MatDialog,
    public router: Router,
    private shopHeaderService: PeHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private builderShare: PeBuilderShareService,
    private readonly appEnv: PeAppEnv,
    private readonly store: Store,
  ) {
    merge(this.resize$, this.configChanged$, this.navigationEnd$, this.sidebars$, this.publishedVersion$).pipe(
      tap(() => this.initHeader()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons(['apps', 'set', 'settings']);

    this.shopHeaderService.initialize();
  }

  private initHeader(): void {
    if (this.isMobile) {
      this.mobileHeaderInit();
    } else {
      this.desktopHeaderInit();
    }
  }

  mobileHeaderInit() {
    const sidebars = this.store.selectSnapshot(PebSidebarsState.sidebars);
    if (this.platformHeaderService.config) {
      this.platformHeaderService.assignConfig(
        Object.assign({}, this.platformHeaderService.config,
           {
            isShowDataGridToggleComponent: false,
            isShowMobileSidenavItems: true,
            isShowMainItem: !sidebars?.left,
            isShowSubheader: true,
            mainItem: {
              title: this.translateService.translate(`${this.appEnv.type}-app.sidebar.title`),
              iconType: 'vector',
              icon: '#icon-arrow-left-48',
              iconDimensions: {
                width: '12px',
                height: '20px',
              },
              onClick: () => {
                this.store.dispatch(new PebSetSidebarsAction({ left: true }));
              },
            },
          },
      ));
    }
  }

  /** Sets desktop header */
  desktopHeaderInit() {
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);

    const itemsMap = [
      {
        name: 'integration',
        title: this.translateService.translate('header.left_section_items.integration'),
      },
      {
        name: 'theme',
        title: this.translateService.translate('header.left_section_items.theme'),
      },
      {
        name: 'view',
        title: this.translateService.translate('header.left_section_items.view'),
      },
      {
        name: 'publish',
        title: this.translateService.translate('header.left_section_items.publish'),
      },
      {
        name: 'edit',
        title: this.translateService.translate('header.left_section_items.edit'),
      },
      {
        name: 'insert',
        title: this.translateService.translate('header.left_section_items.insert'),
      },
      {
        name: 'share',
        title: this.translateService.translate('Share'),
      },
    ];

    const getItemByName = (name: 'integration' | 'theme' | 'view' | 'publish' | 'edit' | 'insert' | 'share') => {
      return itemsMap.find(item => item.name === name);
    };

    const getSectionItemByTitle = (title: 'integration' | 'theme' | 'view' | 'publish' | 'edit' | 'insert') => {
      return this.platformHeaderService.config.leftSectionItems.find(a => a.title === getItemByName(title).title);
    };

    const getDialogPosition = (event: PointerEvent): { top: string, left: string } => {
      const ss = event.currentTarget instanceof Element ? {
        top: '48px',
        left: `${event.currentTarget.getBoundingClientRect().left.toString()}px`,
      } : { top: '0', left: '0' };

      return ss;
    };

    const items: any = [
      {
        title: getItemByName('integration').title,
        class: 'icon-apps-builder-integration',
        onClick: (event: PointerEvent) => {
          const sectionItem = getSectionItemByTitle('integration');
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          const dialogRef = this.dialog.open(PeShopBuilderIntegrationComponent, {
            position: getDialogPosition(event),
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '268px',
            width: '268px',
            panelClass: ['builder-dialog'],
            autoFocus: false,
          });
          dialogRef.backdropClick().pipe(
            tap(() => {
              dialogRef.close();
            }),
            takeUntil(this.destroy$),
          ).subscribe();
          dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          ).subscribe();
        },
      },
      {
        title: getItemByName('theme').title,
        class: 'next-shop__header-button',
        onClick: (event: PointerEvent) => {
          const sectionItem = getSectionItemByTitle('theme');
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          const dialogRef = this.dialog.open(PeShopBuilderThemeComponent, {
            position: getDialogPosition(event),
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '268px',
            width: '268px',
            panelClass: ['builder-dialog'],
            autoFocus: false,
          });
          dialogRef.backdropClick().pipe(
            tap(() => {
              dialogRef.close();
            }),
            takeUntil(this.destroy$),
          ).subscribe();
          dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          ).subscribe();
        },
      },
      {
        title: getItemByName('view').title,
        class: 'next-shop__header-button',
        onClick: (event: PointerEvent) => {
          const sectionItem = getSectionItemByTitle('view');
          const sectionItemClass = sectionItem?.class;

          if (sectionItem) {
            sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          }

          const dialogRef = this.dialog.open(PebShopBuilderViewComponent, {
            position: getDialogPosition(event),
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '267px',
            width: '267px',
            panelClass: 'builder-dialog',
            autoFocus: false,
          });

          dialogRef.backdropClick().pipe(
            tap(() => {
              dialogRef.close();
            }),
            takeUntil(this.destroy$),
          ).subscribe();

          dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          ).subscribe();
        },
      },
      {
        title: getItemByName('publish').title,
        class: 'next-shop__header-button',
        onClick: (event: PointerEvent) => {
          const sectionItem = getSectionItemByTitle('publish');
          const sectionItemClass = sectionItem?.class;
          if (sectionItem) {
            sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          }
          const dialogRef = this.dialog.open(PebEditorPublishDialogComponent, {
            position: getDialogPosition(event),
            hasBackdrop: true,
            backdropClass: 'publish-dialog__backdrop',
            panelClass: ['publish-dialog__panel'],
            data: {
              appId: this.appEnv.id,
              host: this.appEnv.host,
            },
            maxWidth: '286px',
            width: '286px',
            disableClose: false,
            autoFocus: false,
          });

          return dialogRef.afterClosed().pipe(
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          );
        },
      },
      {
        title: getItemByName('edit').title,
        class: 'next-shop__header-button',
        onClick: (event: PointerEvent) => {
          const sectionItem = getSectionItemByTitle('edit');
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          const dialogRef = this.dialog.open(PeShopBuilderEditComponent, {
            position: getDialogPosition(event),
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '286px',
            width: '286px',
            panelClass: ['builder-dialog'],
            autoFocus: false,
          });
          dialogRef.backdropClick().pipe(
            tap(() => {
              dialogRef.close();
            }),
            takeUntil(this.destroy$),
          ).subscribe();
          dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          ).subscribe();
        },
      },
      {
        title: getItemByName('insert').title,
        class: 'next-shop__header-button',
        onClick: (event: any) => {
          const sectionItem = getSectionItemByTitle('insert');
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
          const dialogRef = this.dialog.open(PebShopBuilderInsertComponent, {
            position: getDialogPosition(event),
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '286px',
            width: '286px',
            panelClass: ['builder-dialog'],
            data: {
              shopId: this.appEnv.id,
            },
            autoFocus: false,
          });
          dialogRef.backdropClick().pipe(
            tap(() => {
              dialogRef.close();
            }),
            takeUntil(this.destroy$),
          ).subscribe();

          dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              sectionItem.class = sectionItemClass;
            }),
          ).subscribe();
        },
      },
      {
        title: getItemByName('share').title,
        class: 'next-shop__header-button',
        onClick: () => this.builderShare.openGetLinkDialog(this.appEnv),
        disabled: !publishedVersion,
        tooltip: !publishedVersion ? this.translateService.translate('builder-app.header-menu.cannot_share_published_page') : undefined,
      },
    ];

    if (this.platformHeaderService.config) {
      this.platformHeaderService.assignConfig(
        Object.assign({}, this.platformHeaderService.config, {
          isShowDataGridToggleComponent: true,
          isShowMobileSidenavItems: false,
          isShowMainItem: false,
          isShowSubheader: false,
          leftSectionItems: this.isBuilderPage ? [...items] : [] }),
      );
    }
  }

  ngOnDestroy() {
    this.shopHeaderService.destroy();
  }
}
