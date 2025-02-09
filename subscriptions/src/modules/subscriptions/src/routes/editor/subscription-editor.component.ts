import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { PebEditorApi } from '@pe/builder-api';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-editor';
import { PebEditorState, PebLanguage, PebPageType } from '@pe/builder-core';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { PePlatformHeaderItem } from '@pe/platform-header';

import { PeSubscriptionApi } from '../../api/subscription/abstract.subscription.api';
import { OPTIONS } from '../../constants';
import { SubscriptionEnvService } from '../../api/subscription/subscription-env.service';
import {
  PebSubscriptionBuilderInsertComponent,
  PebSubscriptionBuilderViewComponent,
  PeSubscriptionBuilderEditComponent,
  PeSubscriptionBuilderPublishComponent,
} from '../../components';
@Component({
  selector: 'peb-subscription-editor',
  templateUrl: './subscription-editor.component.html',
  styleUrls: ['./subscription-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSubscriptionEditorComponent implements OnInit, OnDestroy {
  readonly destroyed$ = this.destroy$.asObservable();
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  themeId = this.route.snapshot.params.themeId;
  shopId = this.route.snapshot.params.shopId;

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    private editorApi: PebEditorApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    private apiService: PeSubscriptionApi,
    @Inject(EnvService) private envService: SubscriptionEnvService,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
  ) {
    this.messageBus.emit('subscriptions.toggle.sidebar', true);
  }

  data$ = this.route.snapshot.params.themeId
    ? combineLatest([
      this.editorApi.getShopThemeById(this.route.snapshot.params.themeId),
      this.editorApi.getThemeDetail(this.route.snapshot.params.themeId),
    ]).pipe(map(([theme, snapshot]) => ({ theme, snapshot })))
    : this.editorApi.getShopActiveTheme().pipe(
        catchError((error) => {
          return error;
        }),
        switchMap(({ theme: themeId }) => {
          this.themeId = themeId;
          return combineLatest([this.editorApi.getShopThemeById(themeId), this.editorApi.getThemeDetail(themeId)]).pipe(
            map(([theme, snapshot]) => ({ theme, snapshot })),
          );
        }),
      );

  ngOnInit(): void {
    this.messageBus.emit('subscriptions.builder.init', '');
    document.body.classList.add('pe-builder-styles');
    this.messageBus
      .listen('subscriptions.set.builder_view')
      .pipe(
        tap((data: EditorSidebarTypes | ShopEditorSidebarTypes) => {
          this.setValue(data);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.messageBus
      .listen('editor.application.open')
      .pipe(
        switchMap(() =>
          this.apiService
            .getPlan(this.route.snapshot.params.shopId)
            .pipe(tap((shop: any) => this.messageBus.emit('subscriptions.open', shop))),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.editorState.sidebarsActivity$
      .pipe(
        tap((sidebarsActivity) => {
          OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Navigator).active =
            sidebarsActivity[EditorSidebarTypes.Navigator];
          OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Inspector).active =
            sidebarsActivity[EditorSidebarTypes.Inspector];
          OPTIONS.find((option: any) => option.option === EditorSidebarTypes.Layers).active =
            sidebarsActivity[EditorSidebarTypes.Layers];
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.messageBus
      .listen('subscriptions.set.builder_edit')
      .pipe(
        tap((type: string) => {
          this.editorAccessorService.editorComponent.commands$.next({ type });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.messageBus
      .listen('subscriptions.set.builder_insert')
      .pipe(
        tap(({ type, params }) => {
          this.editorAccessorService.editorComponent.commands$.next({ type, params });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.editorState.pagesView$
      .pipe(
        tap((pagesView: any) => {
          OPTIONS.find((option: any) => option.option === ShopEditorSidebarTypes.EditMasterPages).active =
            pagesView === PebPageType.Master ? true : false;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.messageBus
      .listen('subscriptions.builder-view.open')
      .pipe(
        tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
          const sectionItemClass = sectionItem?.class;
          if (sectionItem) {
            sectionItem.class = `${sectionItemClass} next-subscription__header-button--active`;
          }
          const dialogRef = this.dialog.open(PebSubscriptionBuilderViewComponent, {
            position: {
              top: '48px',
              left: '53px',
            },
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '267px',
            width: '267px',
            panelClass: 'builder-dialog',
            autoFocus: false,
          });
          dialogRef
            .backdropClick()
            .pipe(
              tap(() => {
                dialogRef.close();
              }),
              takeUntil(this.destroyed$),
            )
            .subscribe();
          dialogRef
            .afterClosed()
            .pipe(
              takeUntil(this.destroyed$),
              finalize(() => {
                sectionItem.class = sectionItemClass;
                this.messageBus.emit('subscriptions.header.config', null);
              }),
            )
            .subscribe();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.messageBus
      .listen('subscriptions.builder-publish.open')
      .pipe(
        tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
          const sectionItemClass = sectionItem?.class;
          if (sectionItem) {
            sectionItem.class = `${sectionItemClass} next-subscription__header-button--active`;
          }
          const dialogRef = this.dialog.open(PeSubscriptionBuilderPublishComponent, {
            position: {
              top: '48px',
              left: '116px',
            },
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '286px',
            width: '286px',
            panelClass: ['builder-dialog', this.theme],
            autoFocus: false,
            data: {
              shopId: this.shopId,
            },
          });
          dialogRef
            .backdropClick()
            .pipe(
              tap(() => {
                dialogRef.close();
              }),
              takeUntil(this.destroyed$),
            )
            .subscribe();
          dialogRef
            .afterClosed()
            .pipe(
              filter((ans: any) => !!ans),
              takeUntil(this.destroyed$),
              finalize(() => {
                sectionItem.class = sectionItemClass;
                this.messageBus.emit('subscriptions.header.config', null);
              }),
            )
            .subscribe();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.messageBus
      .listen('subscriptions.builder-edit.open')
      .pipe(
        tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-subscription__header-button--active`;
          const dialogRef = this.dialog.open(PeSubscriptionBuilderEditComponent, {
            position: {
              top: '48px',
              left: '195px',
            },
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '286px',
            width: '286px',
            panelClass: ['builder-dialog', this.theme],
            autoFocus: false,
          });
          dialogRef
            .backdropClick()
            .pipe(
              tap(() => {
                dialogRef.close();
              }),
              takeUntil(this.destroyed$),
            )
            .subscribe();
          dialogRef
            .afterClosed()
            .pipe(
              takeUntil(this.destroyed$),
              finalize(() => {
                sectionItem.class = sectionItemClass;
                this.messageBus.emit('subscriptions.header.config', null);
              }),
            )
            .subscribe();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.messageBus
      .listen('subscriptions.builder-insert.open')
      .pipe(
        tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
          const sectionItemClass = sectionItem?.class;
          sectionItem.class = `${sectionItemClass} next-subscription__header-button--active`;
          const dialogRef = this.dialog.open(PebSubscriptionBuilderInsertComponent, {
            position: {
              top: '48px',
              left: '250px',
            },
            disableClose: false,
            hasBackdrop: true,
            backdropClass: 'builder-backdrop',
            maxWidth: '286px',
            width: '286px',
            panelClass: ['builder-dialog', this.theme],
            data: {
              shopId: this.shopId,
            },
            autoFocus: false,
          });
          dialogRef
            .backdropClick()
            .pipe(
              tap(() => {
                dialogRef.close();
              }),
              takeUntil(this.destroyed$),
            )
            .subscribe();
          dialogRef
            .afterClosed()
            .pipe(
              takeUntil(this.destroyed$),
              finalize(() => {
                sectionItem.class = sectionItemClass;
                this.messageBus.emit('subscriptions.header.config', null);
              }),
            )
            .subscribe();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.editorState.language$
      .pipe(
        tap((language) => {
          const languageOption = OPTIONS.find((o: any) => o.option === 'language');
          if (languageOption) {
            languageOption?.options?.forEach((o) => {
              o.active = o.option === `language.${language}`;
            });
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.messageBus.emit('subscriptions.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
  }

  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview' | string): void {
    if (value === 'preview') {
      this.onOpenPreview(this.themeId);
      return;
    }

    if (value === 'toggleLanguagesSidebar') {
      this.editorAccessorService.editorComponent.commands$.next({ type: 'toggleLanguagesSidebar' });
      return;
    }

    const values = value.split('.');
    if (values[0] === 'language' && values.length > 1) {
      this.editorState.language = values[1] as PebLanguage;
      return;
    }

    const option = OPTIONS.find((o: any) => o.option === value);
    if (option) {
      option.active = !option.active;
      if (!option.disabled) {
        if (value === ShopEditorSidebarTypes.EditMasterPages) {
          this.editorState.pagesView =
            this.editorState.pagesView === PebPageType.Master ? PebPageType.Replica : PebPageType.Master;
        } else {
          this.editorState.sidebarsActivity = {
            ...(this.editorState.sidebarsActivity as any),
            [value]: !this.editorState.sidebarsActivity[value],
          };
        }
      }
    }
  }

  private onOpenPreview(themeId: string) {
    this.editorApi
      .getThemeDetail(themeId)
      .pipe(
        switchMap((snapshot: any) =>
          forkJoin(snapshot.pages.map((p: any) => this.editorApi.getPage(themeId, p.id))).pipe(
            map((pages: any) => ({ snapshot, pages })),
          ),
        ),
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
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
