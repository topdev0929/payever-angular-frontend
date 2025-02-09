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
import { delay, first, repeat, retry, retryWhen, takeUntil, tap } from 'rxjs/operators';
import { race, Subject, timer } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';

import { AppThemeEnum, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PebEditorApi } from '@pe/builder-api';
import { FontLoaderService } from '@pe/builder-font-loader';
import { TranslateService } from '@pe/i18n';
import { PebScreen } from '@pe/builder-core';
import { PeAuthService } from '@pe/auth';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PEB_SHOP_HOST } from '../../constants';
import { PebShopsApi } from '../../services/abstract.shops.api';
import { ShopEnvService } from '../../services/shop-env.service';
import { PeQrPrintComponent } from '../../components/qr-print/qr-print.component';
import { PeQrPrintModule } from '../../components/qr-print/qr-print.module';

@Component({
  selector: 'peb-shop-dashboard',
  templateUrl: './shop-dashboard.component.html',
  styleUrls: ['./shop-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;

  private readonly close$ = new Subject<void>();
  private socketSubject$: WebSocketSubject<any>;
  readonly messages$ = new Subject<any>();

  preview: any;
  loading = true;
  screen: string | PebScreen = PebScreen.Desktop;

  theme = this.envService?.businessData?.themeSettings?.theme ?
  AppThemeEnum[this.envService.businessData.themeSettings.theme] : AppThemeEnum.default;
  shop: any;
  themeActiveVersion: any;

  destroy$ = new Subject<void>();

  get url() {
    return `${this.shop?.accessConfig.internalDomain}.${this.shopHost}`;
  }

  constructor(
    private authService: PeAuthService,
    private messageBus: MessageBus,
    private apiService: PebShopsApi,
    private editorApi: PebEditorApi,
    private clipboard: Clipboard,
    private snackBar: SnackbarService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: ShopEnvService,
    @Inject(PEB_SHOP_HOST) public shopHost: string,
    @Inject(PE_ENV) private env: any,
    private fontLoaderService: FontLoaderService,
    private httpClient: HttpClient,
    private overlayService: PeOverlayWidgetService,
    private compiler: Compiler,

  ) {
    this.fontLoaderService.renderFontLoader();
  }

  ngOnInit(): void {
    this.apiService.getSingleShop(this.route.snapshot.params.shopId).subscribe((shop) => {
      this.shop = shop;
      this.cdr.markForCheck();
    });
    this.editorApi.getShopActiveTheme().subscribe(activeTheme => this.themeActiveVersion = activeTheme);
    this.connect();
    this.socketSubject$.next({
      event: 'pre.install.finished',
      data: {
        id: `pre-install-${this.route.snapshot.params.shopId}`,
        token: this.authService.token,
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOpenItemMenu() {
    import('@pe/connect-app')
      .then((({ ConnectModule }) => this.compiler.compileModuleAsync(ConnectModule)))
      .then(() => this.itemMenuTrigger.openMenu());
  }

  onEditClick(): void {
    this.messageBus.emit('shop.navigate.edit', this.route.snapshot.params.shopId);
  }

  private connect() {
    this.socketSubject$ = webSocket({ url: this.env.backend.builderShopWs });

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
      tap(request => {
        if (request?.data?.status === 'pre-install-finished' && request?.id === `pre-install-${this.route.snapshot.params.shopId}`) {
          this.getShopThemeActiveVersion(request.data.theme);
          this.close$.next();
        }
      }),
      takeUntil(this.close$),
    ).subscribe();
  }

  private getShopThemeActiveVersion(themeId: string) {
    this.editorApi.getShopThemeActiveVersion(themeId).pipe(
      tap((theme: any) => {
        this.getPreview();
      }),
      takeUntil(this.destroy$),
    ).subscribe()
  }

  private getPreview() {
    this.editorApi.getCurrentShopPreview(this.route.snapshot.params.shopId, true, false, 'front').pipe(
      tap(({ current, published }) => {
        this.preview = { current, published };
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  onOpenClick(): void {
    if(!this.shop?.accessConfig.isLive) {
      const msg = this.translateService.translate(`shop-app.info.app_offline`);
      const btn = this.translateService.translate(`shop-app.actions.hide`);
      this.snackBar.toggle(true, {
        content: msg,
      }, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'shop-snack',
      });
      return;
    }
    this.messageBus.emit('shop.open', this.shop);
  }

  onLinkCopy(): void {
    this.clipboard.copy(this.shop?.accessConfig.internalDomain + '.' + this.shopHost);
    const msg = this.translateService.translate(`shop-app.errors.link_copied`);
    const btn = this.translateService.translate(`shop-app.actions.hide`);
    this.snackBar.toggle(true, {
      content: msg,
    }, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'shop-snack',
    });
  }

  onDownloadQR(): void {
    const config: PeOverlayConfig = {
      data: { shop: this.shop },
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
