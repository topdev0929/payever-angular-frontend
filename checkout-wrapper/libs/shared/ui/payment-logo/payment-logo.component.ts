import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

interface IconStyleInterface {
  width: string;
  height: string;
  marginTop?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-payment-logo',
  styleUrls: ['./payment-logo.component.scss'],
  templateUrl: './payment-logo.component.html',
  providers: [PeDestroyService],
})
export class PaymentLogoComponent {

  @Input() isSmall = false;

  @Input() set className(value: string) {
    this.elementRef.nativeElement.className = value || '';
    this.changeDetectorRef.detectChanges();
  }

  @Input() set paymentMethod(paymentMethodParam: PaymentMethodEnum) {
    let paymentMethod = paymentMethodParam;

    // Some payments have the same icons.
    // Therefore, in this switch case, try to download them once to reduce the number of requests
    switch (paymentMethodParam) {
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT:
      case PaymentMethodEnum.SANTANDER_FACTORING_DE:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_DK:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NO:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_SE:
      case PaymentMethodEnum.SANTANDER_INVOICE_DE:
      case PaymentMethodEnum.SANTANDER_INVOICE_NO:
      case PaymentMethodEnum.SANTANDER_POS_FACTORING_DE:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_DE:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_NO:
      case PaymentMethodEnum.SANTANDER_INSTANT_AT:
        paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT;
        break;
      case PaymentMethodEnum.ZINIA_POS_SLICE_THREE:
      case PaymentMethodEnum.ZINIA_POS_SLICE_THREE_DE:
      case PaymentMethodEnum.ZINIA_POS_INSTALLMENT:
      case PaymentMethodEnum.ZINIA_POS_INSTALLMENT_DE:
      case PaymentMethodEnum.ZINIA_BNPL:
      case PaymentMethodEnum.ZINIA_BNPL_DE:
      case PaymentMethodEnum.ZINIA_INSTALLMENT:
      case PaymentMethodEnum.ZINIA_INSTALLMENT_DE:
      case PaymentMethodEnum.ZINIA_POS:
      case PaymentMethodEnum.ZINIA_POS_DE:
      case PaymentMethodEnum.ZINIA_SLICE_THREE_DE:
        paymentMethod = PaymentMethodEnum.ZINIA_SLICE_THREE;
        break;
      case PaymentMethodEnum.SWEDBANK_INVOICE:
      case PaymentMethodEnum.SWEDBANK_CREDITCARD:
        paymentMethod = PaymentMethodEnum.SWEDBANK_INVOICE;
        break;
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_UK:
        paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;
        break;
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_FI:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_AT:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_BE:
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NL:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_AT:
        paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_FI;
        break;
    }

    this.paymentMethodValue = paymentMethod;
    this.updateIcon();
  }

  paymentMethodValue: PaymentMethodEnum;
  iconId: string = null;
  iconStyle$ = new BehaviorSubject<IconStyleInterface>(null);
  private sizeScale = 1;

  constructor(
    protected customElementService: CustomElementService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private destroy$: PeDestroyService,
  ) {}

  updateIconStyle(): boolean {
    const iconElement: HTMLElement = document.getElementById(this.iconId.replace('#', ''));
    if (iconElement) {
      const viewBox: string = iconElement.getAttribute('viewBox') || iconElement.getAttribute('viewbox');
      const size: string[] = viewBox.split(' ');
      const height = iconElement.getAttribute('height')?.replace(/px|%/, '');
      const width = iconElement.getAttribute('width')?.replace(/px|%/, '');

      const result = {
        width: `${Number(width ?? size[2]) * this.sizeScale}px`,
        height: `${Number(height ?? size[3]) * this.sizeScale}px`,
        marginTop: '0',
      };
      if (String(this.paymentMethodValue).startsWith('santander_')) {
        // Santander icon has too big height for choose payment page.
        result.marginTop = '-6px';
      }
      this.iconStyle$.next(result);

      return true;
    }

    return false;
  }

  private updateIcon(): void {
    this.iconId = `#icon-payment-method-${this.paymentMethodValue}`;
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      [`payment-method-${this.paymentMethodValue}`],
      null,
      this.customElementService.shadowRoot
    );
    this.runIconsSizeCheck();
  }

  private runIconsSizeCheck(): void {
    // Have to check by timer while icon not loaded
    const sub = timer(0, 10).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.updateIconStyle()) {
        sub.unsubscribe();
      }
    });
  }
}
