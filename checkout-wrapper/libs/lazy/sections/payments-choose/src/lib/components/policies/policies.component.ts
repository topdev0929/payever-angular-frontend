import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ApiService, LegalDocumentEnum } from '@pe/checkout/api';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowState, SettingsState } from '@pe/checkout/store';
import { FlowInterface, CheckoutSettingsInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

export const DISABLE_AGREEMENT_FOR_PAYMENT: PaymentMethodEnum[] = [
  PaymentMethodEnum.SWEDBANK_INVOICE,
  PaymentMethodEnum.SWEDBANK_CREDITCARD,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
];

interface AgreementTranslationsInterface {
  paymentAgreement: string;
  customAgreement: string;
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'section-policies',
  styleUrls: ['./policies.component.scss'],
  templateUrl: 'policies.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CustomPoliciesComponent
  implements OnInit, OnDestroy, OnChanges {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(SettingsState.settings) private settings: CheckoutSettingsInterface;

  @Input() textContinue: string;
  @Input() paymentMethod: PaymentMethodEnum;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  readonly PaymentMethodEnum = PaymentMethodEnum;

  private dialogRef: MatDialogRef<any>;

  translations: AgreementTranslationsInterface;
  customAgreementText: string;

  constructor(
    protected customElementService: CustomElementService,
    private cdr: ChangeDetectorRef,
    private matDialog: MatDialog,
    private apiService: ApiService,
    private pluginEventsService: PluginEventsService,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['x-16'],
      null,
      this.customElementService.shadowRoot,
    );
  }

  ngOnInit(): void {
    this.prepareTranslations();
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { textContinue } = changes;

    if (textContinue.currentValue) {
      this.prepareTranslations();
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
  }

  get isShowCustomAgreement(): boolean {
    return this.settings
      && (this.settings?.enableLegalPolicy
        || this.settings?.enablePrivacyPolicy
        || this.settings?.enableRefundPolicy
        || this.settings?.enableDisclaimerPolicy
        || this.settings?.enableShippingPolicy)
      && !!this.paymentMethod;
  }

  get isShowDefaultAgreement(): boolean {
    return this.settings
      && (!this.isShowCustomAgreement && this.settings?.enablePayeverTerms || this.settings?.enableCustomerAccount)
      && !!this.paymentMethod
      && !DISABLE_AGREEMENT_FOR_PAYMENT.includes(this.paymentMethod);
  }

  get customAgreementLinks(): string {
    const translatedLinks = {
      termsAndService: $localize `:@@custom_agreement.link_titles.terms_and_service:${this.flow?.businessName}:businessName:`,
      privacyStatement: $localize `:@@custom_agreement.link_titles.privacy_statement:`,
      refundPolicy: $localize `:@@custom_agreement.link_titles.refund_policy:`,
      cookiePolicy: $localize `:@@payment.cookie_policy:`,
      shippingPolicy: $localize `:@@custom_agreement.link_titles.shipping_policy:`,
    };

    const terms = {
      enableLegalPolicy: `<a href="#${LegalDocumentEnum.TermsAndServices}" class="text-secondary"><u>${translatedLinks.termsAndService}</u></a>`,
      enablePrivacyPolicy: `<a href="#${LegalDocumentEnum.PrivacyStatements}" class="text-secondary"><u>${translatedLinks.privacyStatement}</u></a>`,
      enableRefundPolicy: `<a href="#${LegalDocumentEnum.RefundPolicy}" class="text-secondary"><u>${translatedLinks.refundPolicy}</u></a>`,
      enableDisclaimerPolicy: `<a href="#${LegalDocumentEnum.CookiePolicy}" class="text-secondary"><u>${translatedLinks.cookiePolicy}</u></a>`,
      enableShippingPolicy: `<a href="#${LegalDocumentEnum.ShippingPolicy}" class="text-secondary"><u>${translatedLinks.shippingPolicy}</u></a>`,
    };
    const links: string[] = Object.entries(terms).reduce((acc, [key, value]) => {
      const enable = (this.settings as any)?.[key] ?? false;
      enable && acc.push(value);

      return acc;
    }, []);

    links.push(this.peAgreementLink);

    return links.join(', ');
  }

  get peAgreementLink(): string {
    const linkText: string = $localize `:@@payment.agreement_link:`;
    const linkHref: string = $localize `:@@payment.agreement_href:`;

    return `<a href="${linkHref}" target="_blank" class="text-secondary"><u>${linkText}</u></a>`;
  }

  get peCookiePolicyLink(): string {
    const linkText: string = $localize `:@@payment.cookie_policy:`;
    const linkHref: string = $localize `:@@payment.cookie_policy_href:`;

    return `<a href="${linkHref}" target="_blank" class="text-secondary"><u>${linkText}</u></a>`;
  }

  isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  handleLinkClick(event: MouseEvent): void {
    if (event?.composedPath && !this.dialogRef) {
      const paths: HTMLElement[] = event.composedPath() as any;
      const elem: HTMLAnchorElement = paths.find(a => a.nodeName && a.nodeName.toLowerCase() === 'a') as any;
      const href: string = elem?.getAttribute('href') ? elem.getAttribute('href') : '';
      const type: LegalDocumentEnum = href.replace('#', '') as LegalDocumentEnum;
      if ([
        LegalDocumentEnum.TermsAndServices,
        LegalDocumentEnum.PrivacyStatements,
        LegalDocumentEnum.RefundPolicy,
        LegalDocumentEnum.ShippingPolicy,
        LegalDocumentEnum.CookiePolicy,
      ].indexOf(type) >= 0) {
        event.preventDefault();

        this.dialogRef = this.matDialog.open(this.modalContent, {
          autoFocus: false,
          disableClose: false,
          panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-checkout-policies-section-modal-panel'],
        });
        this.dialogRef.afterClosed().subscribe(() => {
          this.dialogRef = null;
          this.customAgreementText = null;
        });
        if (this.isInIframe()) {
          this.pluginEventsService.emitPanelOpened(this.flow.id, 1);
        }

        this.apiService.getLegalDocument(this.settings.businessUuid, type).subscribe((data) => {
          this.customAgreementText = data?.content || '---';
          this.cdr.detectChanges();
        }, () => {
          this.closeModal();
        });
      }
    }
  }

  closeModal(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
    this.customAgreementText = null;
  }

  private prepareTranslations(): void {
    const actionContinue = this.textContinue ? this.textContinue : $localize `:@@action.continue:`;

    this.translations = {
      paymentAgreement: $localize `:@@payment.agreement:${'<b>'+actionContinue+'</b>'}:button:${this.peAgreementLink}:link:`,
      customAgreement: $localize `:@@custom_agreement.line:${'<b>'+actionContinue+'</b>'}:button:${this.customAgreementLinks}:links:`,
    };
  }
}
