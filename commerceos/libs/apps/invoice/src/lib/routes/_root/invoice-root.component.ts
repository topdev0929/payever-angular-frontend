import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';

import { MessageBus, PeDestroyService } from '@pe/common';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { FolderItem } from '@pe/shared/folders';

import { INVOICE_NAVIGATION } from '../../constants';
import { PeInvoiceRoutingPathsEnum } from '../../enum/routing-paths.enum';

export const SIDENAV_NAME = 'app-invoice-sidenav';

@Component({
  selector: 'pe-invoice',
  templateUrl: './invoice-root.component.html',
  styleUrls: ['./invoice-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInvoiceComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;

  treeData: FolderItem<{link: string}>[] = INVOICE_NAVIGATION;
  selectedFolder: FolderItem;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);
  isMobile = document.body.clientWidth <= 720;

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    private readonly destroy$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private headerService: PePlatformHeaderService,
    private translateService: TranslateService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => {
        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[3]?.path ?? 'list';

        this.selectedFolder = this.treeData.find(folder => folder.data.link === path);
        this.mobileTitle$.next(this.selectedFolder?.name);
        this.showMobileTitle$.next(![
          PeInvoiceRoutingPathsEnum.Themes,
          PeInvoiceRoutingPathsEnum.Invoices,
        ].includes(path as PeInvoiceRoutingPathsEnum));
        if (path === 'edit') {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, this.peGridSidenavService.toggleOpenStatus$.value);
        }
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.messageBus.listen('invoice.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.markForCheck();
  }

  navigateToLink(folder: FolderItem) {
    this.router.navigate([folder.data.link],{ relativeTo:this.route }).then(() => {
      this.mobileTitle$.next(folder.name);
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
    this.initTranslations();
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('invoice-app.sidebar.title'),
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
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private changeHeaderConfig(isMobile: boolean) {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['commerceos-invoice-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['commerceos-invoice-app'], err);

        return of(true);
      }),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }
}
