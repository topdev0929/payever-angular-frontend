import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, merge, Observable, race, ReplaySubject, Subject, timer } from 'rxjs';
import {
  delay,
  filter,
  first,
  repeat,
  retry,
  retryWhen,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { MatMenuTrigger } from '@angular/material/menu';

import { MessageBus, PE_ENV } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';
import { SnackbarConfig } from '@pe/snackbar/lib/snackbar.model';
import { TranslateService } from '@pe/i18n-core';
import { PebScreen } from '@pe/builder-core';
import { PeAuthService } from '@pe/auth';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { AbstractSiteBuilderApi } from '../../service/builder/abstract.builder.api';
import { PEB_SITE_HOST } from '../../constants';
import { PebSitesApi } from '../../service/site/abstract.sites.api';
import { PeQrPrintComponent } from '../../components/qr-print/qr-print.component';
import { PeQrPrintModule } from '../../components/qr-print/qr-print.module';

@Component({
  selector: 'peb-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSiteDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;

  editButtonLoading: boolean;
  screen: string | PebScreen = PebScreen.Desktop;

  private readonly close$ = new Subject<void>();
  private socketSubject$: WebSocketSubject<any>;
  readonly messages$ = new Subject<any>();

  private readonly destroy$ = new ReplaySubject<void>(1);

  private readonly previewSubject$ = new BehaviorSubject<{ current: any, published: any }>(null);
  readonly preview$: Observable<any> = this.previewSubject$.asObservable();
  get preview() {
    return this.previewSubject$.getValue();
  }
  set preview(value) {
    this.previewSubject$.next(value);
  }

  private readonly themeActiveVersionSubject$ = new BehaviorSubject(null);
  readonly themeActiveVersion$ = this.themeActiveVersionSubject$.asObservable();
  get themeActiveVersion() {
    return this.themeActiveVersionSubject$.getValue();
  }
  set themeActiveVersion(value) {
    this.themeActiveVersionSubject$.next(value);
  }

  theme = 'dark';
  site: any;

  constructor(
    private authService: PeAuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private clipboard: Clipboard,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private apiService: AbstractSiteBuilderApi,
    private siteApi: PebSitesApi,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(PEB_SITE_HOST) public siteHost: string,
    @Inject(PE_ENV) private env: any,
    private httpClient: HttpClient,
    private overlayService: PeOverlayWidgetService,
    private compiler: Compiler,
  ) {
  }

  get url() {
    return `${this.site?.accessConfig.internalDomain}.${this.siteHost}`;
  }

  ngOnInit() {
    this.siteApi.getSingleSite(this.route.snapshot.params.siteId).subscribe((site) => {
      this.site = site;
      this.cdr.markForCheck();
    });
    this.connect();
    this.socketSubject$.next({
      event: 'pre.install.finished',
      data: {
        id: `pre-install-${this.route.snapshot.params.siteId}`,
        token: this.authService.token,
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  onEditClick(): void {
    this.editButtonLoading = true;
    this.cdr.markForCheck();
    this.messageBus.emit(`${this.entityName}.navigate.edit`, this.route.snapshot.params.siteId);
  }

  onOpenItemMenu() {
    import('@pe/connect-app')
      .then((({ ConnectModule }) => this.compiler.compileModuleAsync(ConnectModule)))
      .then(() => this.itemMenuTrigger.openMenu());
  }

  private connect() {
    this.socketSubject$ = webSocket({ url: this.env.backend.builderSiteWs });

    this.socketSubject$.pipe(
      tap(message => this.messages$.next(message)),
      retryWhen(errors => errors.pipe(delay(2000))),
    ).subscribe();
    race(
      timer(60000).pipe(
        tap(() => this.socketSubject$.next('ping')),
      ),
      this.socketSubject$.pipe(first()),
    ).pipe(
      repeat(),
      retry(),
      takeUntil(this.close$),
    ).subscribe();

    this.socketSubject$.pipe(
      filter(msg => msg?.data?.status === 'pre-install-finished' && msg?.id === `pre-install-${this.route.snapshot.params.siteId}`),
      switchMap(() => {
        const siteId = this.route.parent.snapshot.params.siteId;
        return this.apiService.getSiteActiveTheme(siteId).pipe(
          switchMap((themeActiveVersion) => {
            this.themeActiveVersion = themeActiveVersion;

            return this.apiService.getSitePreview(siteId, '', 'front').pipe(
              tap(({ current, published }) => {
                this.previewSubject$.next({ current, published });
                this.close$.next();
              }),
            );
          }),
        );
      }),
      takeUntil(merge(this.close$, this.destroy$)),
    ).subscribe();
  }

  onOpenClick(): void {
    if (!this.site?.accessConfig.isLive) {
      const msg = this.translateService.translate(`site-app.info.app_offline`);
      const config: SnackbarConfig = {
        content: msg,
        pending: false,
        duration: 2000,
      };
      this.snackbarService.toggle(true, config);
      return;
    }
    this.messageBus.emit(`${this.entityName}.open-site`, this.site);
  }

  onLinkCopy(): void {
    const msg = this.translateService.translate(`site-app.info.link_copied`);
    this.clipboard.copy(this.site?.accessConfig.internalDomain + '.' + this.siteHost);
    const config: SnackbarConfig = {
      content: msg,
      pending: false,
      duration: 2000,
      iconId: 'icon-checked-64',
    };
    this.snackbarService.toggle(true, config);
  }

  onDownloadQR(): void {
    const config: PeOverlayConfig = {
      data: { site: this.site },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate('shop-app.connect.qr_title'),
        backBtnTitle: this.translateService.translate('shop-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('shop-app.actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
      component: PeQrPrintComponent,
      lazyLoadedModule: PeQrPrintModule,
    };
    this.overlayService.open(config);
  }
}
