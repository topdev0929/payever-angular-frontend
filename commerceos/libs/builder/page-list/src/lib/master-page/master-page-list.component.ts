import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PebCreateEmptyPageAction } from '@pe/builder/actions';
import { OVERLAY_POSITIONS, PebPageVariant, PebScreen } from '@pe/builder/core';
import { PebPreviewRendererService } from '@pe/builder/preview-renderer';
import { EditorSidebarTypes } from '@pe/builder/services';
import {
  PebOptionsState,
  PebPagesState,
  PebSetSidebarsAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PebPageListItem } from '../page-list';
import { PebPageListService } from '../page-list.service';


@Component({
  selector: 'peb-master-page-list',
  templateUrl: './master-page-list.component.html',
  styleUrls: ['./master-page-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebMasterPageListComponent {

  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  @ViewChild('pageMenu') pageMenuTemplateRef: TemplateRef<any>;

  private overlayRef: OverlayRef;
  pageList$ = this.pageListService.allPages$.pipe(
    map(pages => pages.filter(page => page.master.isMaster)),
  );

  previewImages = this.previewRendererService.preview;

  constructor(
    private readonly confirmScreenService: ConfirmScreenService,
    private readonly destroy$: PeDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly matDialog: MatDialog,
    private readonly overlay: Overlay,
    private readonly store: Store,
    private readonly pageListService: PebPageListService,
    private readonly snackbarService: SnackbarService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translateService: TranslateService,
    private readonly previewRendererService: PebPreviewRendererService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    const icons = {
      'small-close-icon': 'assets/icons/small-close-icon.svg',
      'side-menu-icon-cc': 'assets/icons/plus-icon.svg',
    };

    Object.entries(icons).forEach(([icon, path]) => {
      const url = domSanitizer.bypassSecurityTrustResourceUrl(path);
      matIconRegistry.addSvgIcon(icon, url);
    });

    this.previewRendererService.previewChanged$.pipe(
      tap(() => this.cdr.detectChanges()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  trackPage(index: number, page: PebPageListItem): string {
    return page.id;
  }

  delete(page: PebPageListItem): void {
    //TODO: check if there is child for this page
    //Apply delete master page => child pages has blank master page

    this.closeContextMenu();

    const pages = this.store.selectSnapshot(PebPagesState.pages);

    if (pages.length === 1) {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('builder-app.delete.delete_single_page_error'),
        duration: 2000,
        iconId: 'icon-alert-24',
      });
    } else if (page.variant === PebPageVariant.Front) {
      const headings: Headings = {
        title: this.translateService.translate('builder-app.pages.delete_page'),
        subtitle: this.translateService.translate('builder-app.delete.delete_home_page_warning'),
        confirmBtnText: this.translateService.translate('builder-app.pages.yes'),
        declineBtnText: this.translateService.translate('builder-app.pages.no'),
      };

      this.confirmScreenService.show(headings, true).pipe(
        filter(Boolean),
        tap(() => {
          this.pageListService.deletePage(page.id);
        }),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe();
    } else {
      this.pageListService.deletePage(page.id);
    }
  }

  drop({ previousIndex, currentIndex }): void {
    this.pageList$.pipe(
      take(1),
      tap((pages) => {
        const previousIndexId = pages[previousIndex].id;
        const currentIndexId = pages[currentIndex].id;

        this.pageListService.arrangePages(previousIndexId, currentIndexId);
      }),
    ).subscribe();
  }

  duplicate(page: PebPageListItem): void {
    this.closeContextMenu();
    this.pageListService.duplicatePage(page.id);
  }

  createEmptyPage() {
    this.store.dispatch(new PebCreateEmptyPageAction({ isMaster: true }));
  }

  openContextMenu(ev: MouseEvent, page: PebPageListItem) {
    ev.preventDefault();
    ev.stopPropagation();

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(ev)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
      takeUntil(this.destroy$),
    ).subscribe();

    const portal = new TemplatePortal(this.pageMenuTemplateRef, this.viewContainerRef, { $implicit: page });
    this.overlayRef.attach(portal);
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  close() {
    this.store.dispatch(new PebSetSidebarsAction({ [EditorSidebarTypes.MasterPages]: false }));
  }
}
