import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeSharedCheckoutStoreService } from '@pe/shared/checkout';
import { SnackbarService, SnackbarConfig } from '@pe/snackbar';

import { PeQrPrintComponent, PeQrPrintModule } from '../../components';
import { PEB_POS_HOST } from '../../constants';
import { PePosProductInterface } from '../../misc/interfaces/product.interface';
import { PosApi } from '../../services';


@Component({
  selector: 'peb-pos-dashboard',
  templateUrl: './pos-dashboard.component.html',
  styleUrls: ['./pos-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosDashboardComponent implements OnInit {

  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;

  terminal: any;

  products$: Observable<PePosProductInterface[]>;
  selectedProduct: PePosProductInterface | null = null;

  constructor(
    private messageBus: MessageBus,
    private apiService: PosApi,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PEB_POS_HOST) public posHost: string,
    private clientStore: PeSharedCheckoutStoreService,
    private overlayService: PeOverlayWidgetService,
    private compiler: Compiler,
    private clipboard: Clipboard,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.apiService.getPos(this.route.snapshot.params.posId).subscribe((terminal) => {
      this.terminal = terminal;
      this.clientStore.app = terminal;
      this.cdr.markForCheck();
    });

    this.products$ = this.apiService.getProducts().pipe(shareReplay());
  }

  onEditClick(): void {
    this.messageBus.emit('pos.navigate.settings_edit', this.route.snapshot.params.posId);
  }

  onOpenItemMenu() {
    this.itemMenuTrigger.openMenu();
  }

  onOpenClick(): void {
    this.messageBus.emit('pos.open', this.terminal);
  }

  onLinkCopy(): void {
    const msg = this.translateService.translate(`pos-app.info.link_copied`);
    this.clipboard.copy(`${this.terminal?.accessConfig?.internalDomain}.${this.posHost}`);
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
      data: { terminal: this.terminal },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate('pos-app.connect.qr.title'),
        backBtnTitle: this.translateService.translate('pos-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('pos-app.actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
      },
      component: PeQrPrintComponent,
      lazyLoadedModule: PeQrPrintModule,
    };
    this.overlayService.open(config);
  }

  showProductDetails(product: PePosProductInterface): void {
    this.selectedProduct = product;
  }

  closeProductDetails(): void {
    this.selectedProduct = null;
  }
}
