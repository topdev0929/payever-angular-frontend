import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, skip, takeUntil, tap } from 'rxjs/operators';

import { PebEditorFaviconDialog, PebEditorIntegrationImportDialog, IntegrationImportMode, PeMainEditorRequestsErrorsEnum } from '@pe/builder/main-editor';
import { PebEditorState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';
import { PeThemeEditorComponent } from '@pe/themes';
import { ThemesApi } from '@pe/themes';

@Component({
  selector: 'pe-shop-builder-theme',
  templateUrl: './builder-theme.component.html',
  styleUrls: ['./builder-theme.component.scss'],
})
export class PeShopBuilderThemeComponent {
  readonly options = [
    {
      title: this.translateService.translate('builder-themes.options.favicon'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/language.svg',
      option: 'openFaviconDialog',
    },
    {
      title: this.translateService.translate('builder-themes.options.edit'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/edit.png',
      option: 'openEditDialog',
    },
    {
      title: this.translateService.translate('builder-themes.options.import_figma_as_theme'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/import.svg',
      option: 'openImport',
    },
    {
      title: this.translateService.translate('builder-themes.options.import_figma_as_pages'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/import.svg',
      option: 'openImportPages',
    },
    {
      title: this.translateService.translate('builder-themes.options.export'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/export.svg',
      option: 'exportTheme',
    },
    {
      title: this.translateService.translate('builder-themes.options.export_pages_to_shopify'),
      disabled: false,
      active: false,
      image: '/assets/builder-app/icons/export.svg',
      option: 'exportPagesToShopify',
    },
  ];

  private readonly intro = this.translateService.translate('builder-themes.notify.theme');

  constructor(
    private dialogRef: MatDialogRef<PeShopBuilderThemeComponent>,
    private dialog: MatDialog,
    private themesApi: ThemesApi,
    private readonly store: Store,
    private translateService: TranslateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private readonly destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
  ) {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    const theme = this.store.selectSnapshot(PebEditorState.theme);
    switch (item.option) {
      case 'openFaviconDialog': {
        this.dialog.open(PebEditorFaviconDialog, {
          panelClass: ['scripts-dialog__panel'],
          width: '436px',
        });
        break;
      }
      case 'openEditDialog': {
        const saveTheme$ = new BehaviorSubject(null);
        saveTheme$
          .pipe(
            skip(1),
            tap((theme: any) => {
                if (theme) {
                  const condition = this.translateService.translate('builder-themes.notify.successfuly_updated');
                  const notify = `${this.intro} "${theme.name}" ${condition}`;
                  this.showSnackbar(notify);
                  this.peOverlayWidgetService.close();
                }
              },
              takeUntil(this.destroy$),
            ))
          .subscribe();

        const config: PeOverlayConfig = {
          data: {
            id: theme.id,
          },
          headerConfig: {
            backBtnTitle: this.translateService.translate('builder-themes.actions.cancel'),
            doneBtnTitle: this.translateService.translate('builder-themes.actions.save'),
            title: theme.name,
            onSaveSubject$: saveTheme$,

          },
          component: PeThemeEditorComponent,
        };
        this.peOverlayWidgetService.open(config);
        break;
      }
      case 'exportTheme': {
        this.themesApi.downloadTheme(theme.id, theme.name + ".json")
          .subscribe();
        break;
      }
      case 'openImport': {
        this.dialog.open(PebEditorIntegrationImportDialog, {
          panelClass: ['integration-import-dialog__panel'],
          width: '800px',
          data: {
            mode: IntegrationImportMode.Theme,
          },
        });
        break;
      }
      case 'openImportPages': {
        this.dialog.open(PebEditorIntegrationImportDialog, {
          panelClass: ['integration-import-dialog__panel'],
          width: '800px',
          data: {
            mode: IntegrationImportMode.Page,
          },
        });
        break;
      }
      case 'exportPagesToShopify': {
        const exportShopifyLoadingConfig: SnackbarConfig = {
          content: 'Exporting to shopify...',
          pending: true,
          duration: null,
        };
        this.snackbarService.toggle(true, exportShopifyLoadingConfig);

        this.themesApi.exportPagesToShopify(theme.id).pipe(
          tap(() => {
            this.showSnackbar(this.translateService.translate('builder-themes.notify.export_pages_successfuly'));
          }),
          catchError((error) => {
            if (error.error === PeMainEditorRequestsErrorsEnum.ExportThemeNoExportIntegrationError) {
              this.showSnackbar(this.translateService.translate('builder-themes.messages.no_export_design_integration'), false);
            } else {
              this.showSnackbar(this.translateService.translate('builder-themes.notify.export_pages_failed'), false);
            }

            return of({});
          })
        ).subscribe();
        break;
      }
      default:
        break;
    }

    this.dialogRef.close();
  }

  private showSnackbar(notify: string, success = true): void {
    const iconId = success ? 'icon-commerceos-success' : 'icon-alert-24';
    const iconColor = success ? '#00B640' : '#E2BB0B';
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor,
      iconId,
      iconSize: 24,
    });
  }
}
