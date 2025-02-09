import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { PebEditorApi } from '@pe/builder-api';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-editor';
import { PebEditorState, PebLanguage, PebPageType } from '@pe/builder-core';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { PePlatformHeaderItem } from '@pe/platform-header';

import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { InvoiceEditorSidebarTypes, OPTIONS } from '../../constants';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import {
  PebInvoiceBuilderViewComponent,
  PeInvoiceBuilderPublishComponent,
  PeInvoiceBuilderEditComponent,
  PebInvoiceBuilderInsertComponent } from '../../components';

@Component({
  selector: 'peb-invoice-editor',
  templateUrl: './invoice-editor.component.html',
  styleUrls: ['./invoice-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class InvoiceEditorComponent implements OnInit, OnDestroy {
  readonly destroyed$ = this.destroy$.asObservable();
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  themeId = this.route.snapshot.params.themeId;
  invoiceId = this.route.snapshot.params.invoiceId;

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    public router: Router,
    private editorApi: PebEditorApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    private apiService: PeInvoiceApi,
    @Inject(EnvService) private envService: InvoiceEnvService,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
  ) {
    this.messageBus.emit('invoice.toggle.sidebar', true);
  }

  data$ = this.themeId ?
    combineLatest([
      this.editorApi.getShopThemeById(this.themeId),
      this.editorApi.getThemeDetail(this.themeId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    ) : this.editorApi.getShopActiveTheme().pipe(
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
    document.body.classList.add('pe-builder-styles');
    this.messageBus.emit('invoice.builder.init', '');
    this.messageBus.listen('invoice.set.builder_view').pipe(
      tap((data: EditorSidebarTypes | InvoiceEditorSidebarTypes) => {
        this.setValue(data);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('editor.application.open').pipe(
      switchMap(() => this.apiService.getSingleInvoice(this.route.snapshot.params.invoiceId).pipe(
        tap((invoice) => this.messageBus.emit('invoice.open', invoice)),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen(`invoice.theme.installed`).pipe(
      tap((themeId: any) => {
        this.router.navigate([`/invoice/edit`])
      })),

    this.editorState.sidebarsActivity$.pipe(
      tap((sidebarsActivity) => {
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Navigator).active = sidebarsActivity[EditorSidebarTypes.Navigator];
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Inspector).active = sidebarsActivity[EditorSidebarTypes.Inspector];
        OPTIONS.find((option) =>
          option.option === EditorSidebarTypes.Layers).active = sidebarsActivity[EditorSidebarTypes.Layers];
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('invoice.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('invoice.set.builder_insert').pipe(
      tap(({ type, params }) => {
        this.editorAccessorService.editorComponent.commands$.next({ type, params });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.editorState.pagesView$.pipe(
      tap((pagesView: any) => {
        OPTIONS.find((option) =>
          option.option ===
          InvoiceEditorSidebarTypes.EditMasterPages).active = pagesView === PebPageType.Master ? true : false;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('invoice.builder-view.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-invoice__header-button--active`;
        }
        const dialogRef = this.dialog.open(PebInvoiceBuilderViewComponent, {
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
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('invoice.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('invoice.builder-publish.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-invoice__header-button--active`;
        }
        const dialogRef = this.dialog.open(PeInvoiceBuilderPublishComponent, {
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
            invoiceId: this.invoiceId,
          },
        });
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          filter(ans => !!ans),
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('invoice.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('invoice.builder-edit.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-invoice__header-button--active`;
        const dialogRef = this.dialog.open(PeInvoiceBuilderEditComponent, {
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
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('invoice.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('invoice.builder-insert.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-invoice__header-button--active`;
        const dialogRef = this.dialog.open(PebInvoiceBuilderInsertComponent, {
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
            invoiceId: this.invoiceId,
          },
          autoFocus: false,
        });
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('invoice.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.editorState.language$.pipe(
      tap((language) => {
        const languageOption = OPTIONS.find(o => o.option === 'language');
        if (languageOption) {
          languageOption?.options?.forEach((o) => {
            o.active = o.option === `language.${language}`;
          });
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();


  }

  ngOnDestroy() {
    this.messageBus.emit('invoice.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
  }


  setValue(value: EditorSidebarTypes | InvoiceEditorSidebarTypes | 'preview' | string): void {
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

    const option = OPTIONS.find((o) => o.option === value)
    if (option) {
      option.active = !option.active;
      if (!option.disabled) {
        if (value === InvoiceEditorSidebarTypes.EditMasterPages) {
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
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
