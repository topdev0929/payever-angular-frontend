import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MessageBus, PebEditorState, PebEnvService, PebLanguage, PebPageType } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';

import { OPTIONS } from '../../constants';

@Component({
  selector: 'peb-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PebBlogEditorComponent implements OnInit, OnDestroy {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
    themeId =this.route.snapshot.params.themeId

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    private editorApi: PebEditorApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    private envService: PebEnvService,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
  ) {
  }



  data$ = this.route.snapshot.params.themeId ?

    combineLatest([
      this.editorApi.getShopThemeById(this.route.snapshot.params.themeId),
      this.editorApi.getThemeDetail(this.route.snapshot.params.themeId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    ) : this.editorApi.getShopActiveTheme(this.route.snapshot.params.blogId).pipe(
      catchError((error) => {
        return error;
      }),
      switchMap(({ theme: themeId }) => {
        this.themeId = themeId;
        return combineLatest([
          this.editorApi.getShopThemeById(themeId),
          this.editorApi.getThemeDetail(themeId),
        ]).pipe(
          map(([theme, snapshot]) => ({ theme, snapshot })),
        );
      }),
    );

  ngOnInit(): void {
    this.messageBus.emit('blog.builder.init', {
      shop: this.route.snapshot.params.blogId,
      theme: this.route.snapshot.params.themeId,
    })
    document.body.classList.add('pe-builder-styles');
    this.messageBus.listen('blog.set.builder_view').pipe(
      tap((data: EditorSidebarTypes | ShopEditorSidebarTypes) => {
        this.setValue(data);
      }),
      takeUntil(this.destroy$),
    ).subscribe()

    this.editorState.sidebarsActivity$.pipe(
      tap((sidebarsActivity) => {
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Navigator).active = sidebarsActivity[EditorSidebarTypes.Navigator];
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Inspector).active = sidebarsActivity[EditorSidebarTypes.Inspector];
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Layers).active = sidebarsActivity[EditorSidebarTypes.Layers];
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('blog.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroy$),
    ).subscribe()

    this.editorState.pagesView$.pipe(
      tap((pagesView: any) => {
        OPTIONS.find((option) =>
          option.option ===
          ShopEditorSidebarTypes.EditMasterPages).active = pagesView === PebPageType.Master ? true : false;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.editorState.language$.pipe(
      tap((language) => {
        const languageOption = OPTIONS.find(o => o.option === 'language');
        if (languageOption) {
          languageOption?.options?.forEach((o) => {
            o.active =  o.option === `language.${language}`;
          });
        }
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.messageBus.emit('blog.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
    this.destroy$.next();
    this.destroy$.complete();
  }


  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview' | string): void {
    if (value ==='preview') {
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

    const option = OPTIONS.find((o) => o.option === value)
    if (option) {
      option.active = !option.active;
      if (!option.disabled) {
        if (value === ShopEditorSidebarTypes.EditMasterPages) {
          this.editorState.pagesView =
            this.editorState.pagesView === PebPageType.Master ?
              PebPageType.Replica : PebPageType.Master;
        } else {
          this.editorState.sidebarsActivity = {
            ...this.editorState.sidebarsActivity as any,
            [value]: !this.editorState.sidebarsActivity[value],
          }
        }
      }
    }
  }

  private onOpenPreview(themeId: string) {
    this.editorApi.getThemeDetail(themeId).pipe(
      switchMap(snapshot => forkJoin(
        snapshot.pages.map(p => this.editorApi.getPage(themeId, p.id)),
      ).pipe(
        map(pages => ({ snapshot, pages })),
      )),
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
      takeUntil(this.destroy$),
    ).subscribe();
    }
}
