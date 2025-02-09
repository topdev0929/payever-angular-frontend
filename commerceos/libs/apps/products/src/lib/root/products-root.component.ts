import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil } from 'rxjs/operators';

import {
  AppType,
  BusinessInterface,
  PeDestroyService,
  PreloaderState,
  MessageBus
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { ProductsAppState } from '@pe/shared/products';
import { PeSimpleStepperService } from '@pe/stepper';
import { BusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { PeProductsHeaderService } from '../services/products-header.service';

@Component({
  selector: 'cos-products-root',
  templateUrl: './products-root.component.html',
  styleUrls: ['./products-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class CosProductsRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(ProductsAppState.popupMode) popupMode: boolean;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(PreloaderState.loading) loading: {};

  isDashboardRoute: boolean;

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private productsHeaderService: PeProductsHeaderService,
    private translateService: TranslateService,
    private wallpaperService: WallpaperService,
    private confirmationService: ConfirmScreenService,
    private messageBus: MessageBus,
    private destroy$: PeDestroyService,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  get isGlobalLoading(): boolean {
    return this.loading[AppType.Products];
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
      'apps',
      'edit-panel',
    ]);
    this.wallpaperService.showDashboardBackground(false); //.

    if (!this.popupMode) {
      this.productsHeaderService.init();
    }

    this.listenConfirmationEvents();
  }

  private listenConfirmationEvents() {
    this.messageBus.listen('open-confirm')
      .pipe(takeUntil(this.destroy$))
      .subscribe((headings: Headings) => {
        this.confirmationService.show(headings, false);
      });
  }

  ngOnDestroy() {
    this.productsHeaderService.destroy();
  }
}
