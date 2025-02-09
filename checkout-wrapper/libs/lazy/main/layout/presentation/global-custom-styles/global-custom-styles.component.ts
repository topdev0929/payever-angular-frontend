import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import cssVarsPonyfill from 'css-vars-ponyfill';
import { combineLatest } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { CheckoutStyleInterface } from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { WindowSizeInterface, WindowSizesService, WindowStylesService } from '@pe/checkout/window';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-global-custom-style',
  template: '',
})
export class GlobalCustomStylesComponent extends AbstractFlowIdComponent {

  private windowService = this.injector.get(WindowSizesService);
  private windowStylesService = this.injector.get(WindowStylesService);
  private paymentHelperService = this.injector.get(PaymentHelperService);

  initFlow(): void {
    super.initFlow();

    combineLatest([this.settings$, this.windowService.windowSizeInfo$]).pipe(
      switchMap(([settings, windowSizeInfo]) => this.params$.pipe(
        tap(({ clientMode, merchantMode }) => {
          this.applyStyles(
            settings.styles || {},
            settings.styles?.active
            && !clientMode
            && !merchantMode,
            windowSizeInfo,
          );
        })
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private applyStyles(
    styles: CheckoutStyleInterface,
    applyHeaderStyles: boolean,
    windowSizeInfo: WindowSizeInterface,
  ): void {
    const logoWidth = this.normalizeSize(
      this.windowStylesService.matchStyle('businessLogo', 'Width', windowSizeInfo, styles),
      'auto'
    );
    const logoHeight = this.normalizeSize(
      this.windowStylesService.matchStyle('businessLogo', 'Height', windowSizeInfo, styles), 
      null
    );

    const logoPaddingTop = this.windowStylesService.
      matchStyle('businessLogo', 'PaddingTop', windowSizeInfo, styles) || '5px';
    const logoPaddingBottom = this.windowStylesService.
      matchStyle('businessLogo', 'PaddingBottom', windowSizeInfo, styles) || '5px';
    const logoPaddingRight = this.windowStylesService.
      matchStyle('businessLogo', 'PaddingRight', windowSizeInfo, styles) || '0px';
    const logoPaddingLeft = this.windowStylesService.
      matchStyle('businessLogo', 'PaddingLeft', windowSizeInfo, styles) || '0px';

    const headerHeight = applyHeaderStyles
      ? (
        this.normalizeSize(
          this.windowStylesService.
            matchStyle('businessHeader', 'Height', windowSizeInfo, styles),
          '55px'
        )
      )
      : '55px';

    this.updatePalette({
      '--checkout-business-header-border-color': applyHeaderStyles
        ? styles.businessHeaderBorderColor
        : null,
      '--checkout-business-header-background-color': applyHeaderStyles
        ? styles.businessHeaderBackgroundColor
        : null,
      '--checkout-business-header-height': coerceCssPixelValue(headerHeight),
      '--checkout-button-share-text-color': styles.active
        ? styles.buttonShareTextColor || styles.buttonSecondaryTextColor
        : null,
      '--checkout-button-share-background-color': styles.active
        ? styles.buttonShareBackgroundColor || styles.buttonSecondaryBackgroundColor
        : null,
      '--checkout-button-share-background-disabled-color': styles.active
        ? styles.buttonShareBackgroundDisabledColor || styles.buttonSecondaryBackgroundDisabledColor
        : null,
      '--checkout-button-share-border-radius': styles.active
        ? styles.buttonShareBorderRadius || styles.buttonSecondaryBorderRadius
        : null,

      '--checkout-header-cancel-text-color': applyHeaderStyles
        ? styles.buttonSecondaryTextColor
        : null,
      '--checkout-header-cancel-background-color': applyHeaderStyles
        ? styles.buttonSecondaryBackgroundColor
        : null,
      '--checkout-header-cancel-background-disabled-color': applyHeaderStyles
        ? styles.buttonSecondaryBackgroundDisabledColor
        : null,
      '--checkout-header-cancel-border-radius': applyHeaderStyles
        ? styles.buttonSecondaryBorderRadius
        : null,

      '--checkout-header-border-color': applyHeaderStyles
        ? styles.pageLineColor
        : null,
      '--checkout-header-background-color': applyHeaderStyles
        ? styles.pageBackgroundColor
        : null,

      '--checkout-page-text-primary-color': styles.active
        ? styles.pageTextPrimaryColor
        : null,
      '--checkout-page-text-secondary-color': styles.active
        ? styles.pageTextSecondaryColor
        : null,
      '--checkout-page-background-color': styles.active
        ? styles.pageBackgroundColor
        : null,
      '--checkout-page-line-color': styles.active
        ? styles.pageLineColor
        : null,

      '--checkout-button-text-color': styles.active
        ? styles.buttonTextColor
        : null,
      '--checkout-button-background-color': styles.active
        ? styles.buttonBackgroundColor
        : null,
      '--checkout-button-background-disabled-color': styles.active
        ? styles.buttonBackgroundDisabledColor
        : null,
      '--checkout-button-border-radius': styles.active
        ? styles.buttonBorderRadius
        : null,

      '--checkout-button-secondary-text-color': styles.active
        ? styles.buttonSecondaryTextColor
        : null,
      '--checkout-button-secondary-background-color': styles.active
        ? styles.buttonSecondaryBackgroundColor
        : null,
      '--checkout-button-secondary-background-disabled-color': styles.active
        ? styles.buttonSecondaryBackgroundDisabledColor
        : null,
      '--checkout-button-secondary-border-radius': styles.active
        ? styles.buttonSecondaryBorderRadius
        : null,

      '--checkout-input-background-color': styles.active
        ? styles.inputBackgroundColor
        : null,
      '--checkout-input-border-color': styles.active
        ? styles.inputBorderColor
        : null,
      '--checkout-input-text-primary-color': styles.active
        ? styles.inputTextPrimaryColor
        : null,
      '--checkout-input-text-secondary-color': styles.active
        ? styles.inputTextSecondaryColor
        : null,
      '--checkout-input-border-radius': styles.active
        ? styles.inputBorderRadius
        : null,

      '--checkout-logo-width': applyHeaderStyles
        ? logoWidth || 'auto'
        : 'auto',
      ...(logoHeight
        ? { '--checkout-logo-height': logoHeight }
        : null
      ),
      '--checkout-logo-margin-top': logoPaddingTop,
      '--checkout-logo-margin-right': logoPaddingRight,
      '--checkout-logo-margin-bottom': logoPaddingBottom,
      '--checkout-logo-margin-left': logoPaddingLeft,
      '--checkout-logo-object-position': this.windowStylesService.businessLogoAlignment(windowSizeInfo, styles),
    });
  }

  private normalizeSize(size: string, defaultValue = 'auto') {
    return !size || size === '0px'
      ? defaultValue
      : size;
  }

  private updatePalette(palette: {
    [key: string]: string;
  }): void {
    cssVarsPonyfill({
      variables: palette,
    });
  }
}
