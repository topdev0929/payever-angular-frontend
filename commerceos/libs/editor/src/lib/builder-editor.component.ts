/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { forkJoin, merge, Observable, Subject } from 'rxjs';
import { catchError, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
import { PebLanguage, PebPageType } from '@pe/builder/core';
import { EditorSidebarTypes, PebEditorState } from '@pe/builder/services';
import { PebOptionsState } from '@pe/builder/state';
import { PebViewerPreviewDialog } from '@pe/builder/viewer';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { APP_TYPE, AppType, MessageBus, PeDestroyService } from '@pe/common';
import { PeHeaderMenuService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderItem, PePlatformHeaderService } from '@pe/platform-header';

import { PeBuilderHeaderMenuComponent } from './builder-menu';
import { EDIT_MENU_OPTION, ICONS, INSERT_MENU_OPTION, VIEW_MENU_OPTIONS } from './builder-menus.constants';
import { PeBuilderHeaderMenuActionsEnum, PeBuilderHeaderToolbarItemsEnum } from './enums';
import { PeBuilderHeaderMenuDataInterface, PeBuilderHeaderMenuOptionInterface } from './interfaces';

@Component({
  selector: 'pe-builder-editor',
  templateUrl: './builder-editor.component.html',
  styleUrls: ['./builder-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeBuilderEditorComponent implements OnInit, OnDestroy {

  @Select(PebOptionsState.language) language$!: Observable<PebLanguage>;

  private themeId: string;

  private readonly editTitle = this.translateService.translate('builder-app.header-menu.edit.title');
  private readonly insertTitle = this.translateService.translate('builder-app.header-menu.insert.title');
  private readonly publishTitle = this.translateService.translate('builder-app.header-menu.publish.title');
  private readonly viewTitle = this.translateService.translate('builder-app.header-menu.view.title');

  public readonly data$ = this.pebEditorApi.getActiveTheme()
    .pipe(
      switchMap(({ theme: themeId }) => {
        this.themeId = themeId;

        return forkJoin([
          this.pebEditorApi.getThemeById(themeId),
          this.pebEditorApi.getThemeDetail(themeId),
        ]);
      }),
      map(([theme, snapshot]) => ({ theme, snapshot })),
      catchError(error => error));

  private readonly menusEvents$ = new Subject<any>();
  private readonly editorHeaderMenusEvents$ = this.menusEvents$
    .pipe(
      switchMap(({ event, sectionItem, target }: {
        event: PeBuilderHeaderToolbarItemsEnum,
        sectionItem: PePlatformHeaderItem,
        target: any,
      }) => {
        const sectionItemClass = sectionItem?.class;

        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} builder-header-menu__button_active`;
        }

        let leftPosition: string;
        let menuAction: PeBuilderHeaderMenuActionsEnum = null;
        let menuOptions: PeBuilderHeaderMenuOptionInterface[] = [];
        let menuTitle: string;

        switch (event) {
          case PeBuilderHeaderToolbarItemsEnum.EditMenu:
            leftPosition = '195px';
            menuAction = PeBuilderHeaderMenuActionsEnum.SetBuilderEdit;
            menuOptions = EDIT_MENU_OPTION;
            menuTitle = 'builder-app.header-menu.edit.title';
            break;
          case PeBuilderHeaderToolbarItemsEnum.InsertMenu:
            leftPosition = '250px';
            menuAction = PeBuilderHeaderMenuActionsEnum.SetBuilderInsert;
            menuOptions = INSERT_MENU_OPTION;
            menuTitle = 'builder-app.header-menu.insert.title';
            break;
          case PeBuilderHeaderToolbarItemsEnum.ViewMenu:
            leftPosition = '53px';
            menuAction = PeBuilderHeaderMenuActionsEnum.SetBuilderView;
            menuOptions = VIEW_MENU_OPTIONS;
            menuTitle = 'builder-app.header-menu.view.title';
            break;
          case PeBuilderHeaderToolbarItemsEnum.PublishMenu:
            //emit from publish-dialog from builder-editor
            return this.messageBus
              .listen('editor.publish-dialog.closed')
              .pipe(
                tap(() => {
                  sectionItem.class = sectionItemClass;
                  this.refreshMenuPanel(null);
                }));
        }

        const component = PeBuilderHeaderMenuComponent;
        const menuData: PeBuilderHeaderMenuDataInterface = {
          action: menuAction,
          options: menuOptions,
          title: menuTitle,
        };

        const width = '286px';
        const dialogRef = this.dialog.open(
          component,
          {
            autoFocus: false,
            backdropClass: 'builder-header-menu__backdrop',
            data: menuData,
            disableClose: false,
            hasBackdrop: true,
            maxWidth: width,
            panelClass: 'builder-header-menu__dialog',
            position: {
              top: '48px',
              left: leftPosition,
            },
            width: width,
          }
        );

        const afterClosed$ = dialogRef.afterClosed()
          .pipe(
            finalize(() => {
              sectionItem.class = sectionItemClass;
              this.refreshMenuPanel(null);
            }));

        const backdropClick$ = dialogRef.backdropClick()
          .pipe(
            tap(() => {
              dialogRef.close();
            }));

        return merge(
          afterClosed$,
          backdropClick$,
        );
      }));

  private readonly editorLanguage$ = this.language$
    .pipe(
      tap((language) => {
        const languageOption = VIEW_MENU_OPTIONS.find((option: any) => option.option === 'language');
        if (languageOption) {
          languageOption?.options?.forEach((option) => {
            option.active = option.option === `language.${language}`;
          });
        }
      }),
    );

  private readonly editorPagesView$ = this.pebEditorState.pagesView$
    .pipe(
      tap((pagesView: any) => {
        VIEW_MENU_OPTIONS.find((option: any) => option.option === ShopEditorSidebarTypes.EditMasterPages)
          .active = pagesView === PebPageType.Master;
      }));

  private readonly editorSidebarActivity$ = this.pebEditorState.sidebarsActivity$
    .pipe(
      tap((sidebarsActivity) => {
        VIEW_MENU_OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Navigator)
          .active = sidebarsActivity[EditorSidebarTypes.Navigator];
        VIEW_MENU_OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Inspector)
          .active = sidebarsActivity[EditorSidebarTypes.Inspector];
        VIEW_MENU_OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Layers)
          .active = sidebarsActivity[EditorSidebarTypes.Layers];
      }));

  private readonly setBuilderEdit$ = this.messageBus
    .listen(PeBuilderHeaderMenuActionsEnum.SetBuilderEdit)
    .pipe(
      tap((menuItem: PeBuilderHeaderMenuOptionInterface) => {
        this.setValue(EditorSidebarTypes.Inspector, true);
      }));

  private readonly setBuilderInsert$ = this.messageBus
    .listen(PeBuilderHeaderMenuActionsEnum.SetBuilderInsert);

  private readonly setBuilderView$ = this.messageBus
    .listen(PeBuilderHeaderMenuActionsEnum.SetBuilderView)
    .pipe(
      tap((menuItem: PeBuilderHeaderMenuOptionInterface) => {
        this.setValue(menuItem.option);
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    @Inject(APP_TYPE) private appType: AppType,
    private messageBus: MessageBus,
    private pebEditorApi: PebEditorApi,
    private pebEditorState: PebEditorState,
    private peHeaderMenuService: PeHeaderMenuService,
    private pePlatformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnDestroy(): void {
    this.pePlatformHeaderService.assignConfig({
      ...this.pePlatformHeaderService.config,
      leftSectionItems: null,
    });
  }

  ngOnInit(): void {
    this.initIcons();
    if (window.innerWidth <= 720) {
      this.mobileHeaderInit();
    } else {
      this.desktopHeaderInit();
    }

    merge(
      this.editorHeaderMenusEvents$,
      this.editorLanguage$,
      this.editorPagesView$,
      this.editorSidebarActivity$,
      this.setBuilderEdit$,
      this.setBuilderInsert$,
      this.setBuilderView$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private initIcons(): void {
    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }

  private desktopHeaderInit(): void {
    const generalMenuConfig: PePlatformHeaderItem = {
      class: 'builder-header-menu__button',
      iconType: 'vector',
      iconSize: '24px',
    };

    const VIEW_MENU: PePlatformHeaderItem = {
      ...generalMenuConfig,
      icon: '#icon-apps-builder-view',
      isActive: true,
      onClick: () => {
        const event = PeBuilderHeaderToolbarItemsEnum.ViewMenu;
        const sectionItem = this.pePlatformHeaderService.config.leftSectionItems[0];
        const actionConfig = { event, sectionItem };
        this.menusEvents$.next(actionConfig);
      },
      title: this.viewTitle,
    };

    const PUBLISH_MENU: PePlatformHeaderItem = {
      ...generalMenuConfig,
      icon: '#icon-apps-builder-publish',
      onClick: ({ currentTarget }: Event) => {
        const event = PeBuilderHeaderToolbarItemsEnum.PublishMenu;
        const sectionItem = this.pePlatformHeaderService.config.leftSectionItems[1];
        const target = currentTarget;
        const actionConfig = { event, sectionItem, target };
        this.menusEvents$.next(actionConfig);
      },
      title: this.publishTitle,
    };

    const EDIT_MENU: PePlatformHeaderItem = {
      ...generalMenuConfig,
      icon: '#icon-apps-builder-publish',
      onClick: () => {
        const event = PeBuilderHeaderToolbarItemsEnum.EditMenu;
        const sectionItem = this.pePlatformHeaderService.config.leftSectionItems[2];
        const actionConfig = { event, sectionItem };
        this.menusEvents$.next(actionConfig);
      },
      title: this.editTitle,
    };

    const INSERT_MENU: PePlatformHeaderItem = {
      ...generalMenuConfig,
      icon: '#icon-apps-builder-publish',
      onClick: () => {
        const event = PeBuilderHeaderToolbarItemsEnum.InsertMenu;
        const sectionItem = this.pePlatformHeaderService.config.leftSectionItems[3];
        const actionConfig = { event, sectionItem };
        this.menusEvents$.next(actionConfig);
      },
      title: this.insertTitle,
    };

    this.pePlatformHeaderService.assignConfig({
      ...this.pePlatformHeaderService.config,
      leftSectionItems: [
        VIEW_MENU,
        PUBLISH_MENU,
        EDIT_MENU,
        INSERT_MENU,
      ],
    });
  }

  private mobileHeaderInit(): void {
    this.pePlatformHeaderService.assignConfig({
      leftSectionItems: [
        {
          icon: '#icon-header-menu',
          iconSize: '25px',
          iconType: 'vector',
          onClick: () => {
            const data = {
              option: [
                {
                  title: 'Menu',
                  icon: '#icon-edit-pencil-24',
                  list: [
                    {
                      icon: '#icon-apps-builder-view',
                      label: this.viewTitle,
                      value: PeBuilderHeaderToolbarItemsEnum.ViewMenu,
                    },
                    {
                      icon: '#icon-apps-builder-publish',
                      label: this.publishTitle,
                      value: PeBuilderHeaderToolbarItemsEnum.PublishMenu,
                    },
                    {
                      icon: '#icon-apps-builder-publish',
                      label: this.editTitle,
                      value: PeBuilderHeaderToolbarItemsEnum.EditMenu,
                    },
                    {
                      icon: '#icon-apps-builder-publish',
                      label: this.insertTitle,
                      value: PeBuilderHeaderToolbarItemsEnum.InsertMenu,
                    },
                  ],
                },
              ],
            };

            const dialogRef = this.peHeaderMenuService.open({ data: data });

            dialogRef.afterClosed
              .pipe(
                take(1),
                tap((menuItem) => {
                  this.messageBus.emit(
                    `${this.appType}.${menuItem}.open`,
                    {
                      sectionItem: {
                        class: 'builder-header-menu__button',
                      },
                    }
                  );
                }),
                takeUntil(this.destroy$))
              .subscribe();
          },
        },
      ],
    });
  }

  private setValue(
    value: string,
    showInspector?: boolean
  ): void {
    if (value === 'preview') {
      this.onOpenPreview(this.themeId);

      return;
    }

    const option = VIEW_MENU_OPTIONS.find((option: PeBuilderHeaderMenuOptionInterface) => option.option === value);
    if (option) {
      option.active = !option.active;
      if (!option.disabled) {
        if (value === ShopEditorSidebarTypes.EditMasterPages) {
          this.pebEditorState.pagesView = this.pebEditorState.pagesView === PebPageType.Master
            ? PebPageType.Replica
            : PebPageType.Master;
        } else {
          this.pebEditorState.sidebarsActivity = {
            ...(this.pebEditorState.sidebarsActivity as any),
            [value]: showInspector ?? !this.pebEditorState.sidebarsActivity[value],
          };
        }
      }
    }
  }

  private onOpenPreview(themeId: string): void {
    this.pebEditorApi
      .getThemeDetail(themeId)
      .pipe(
        switchMap((snapshot) => {
          const pages$ = snapshot.pages.map(page => this.pebEditorApi.getPage(themeId, page.id));

          return forkJoin(pages$)
            .pipe(map(pages => ({ snapshot, pages })));
        }),
        tap((themeSnapshot) => {
          this.dialog.open(PebViewerPreviewDialog, {
            position: {
              top: '0',
              left: '0',
            },
            height: '100vh',
            maxWidth: '100vw',
            width: '100vw',
            panelClass: 'themes-preview-dialog',
            data: {
              themeSnapshot,
            },
          });
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private refreshMenuPanel(config): void {
    this.pePlatformHeaderService.assignConfig(config ?? this.pePlatformHeaderService.config);
    this.cdr.detectChanges();
  }
}
