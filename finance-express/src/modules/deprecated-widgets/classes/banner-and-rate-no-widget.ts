/* tslint:disable */
import { Payever } from '../global';
import { addClass, removeClass } from '../helpers/index';
import { BannerAndRateWidgetGeneral } from './banner-and-rate-general-widget';

export class BannerAndRateNOWidget extends BannerAndRateWidgetGeneral {

  activator: HTMLElement;
  link: HTMLLinkElement;

  static dynamicStyleSheet() {
    const parentStyles = super.dynamicStyleSheet();
    const specificStyles = [
      '.payever-finance-express.payever-banner-and-rate .payever-rate .payever-footer {padding: 0; font-size: 12px;}',
      '.payever-finance-express.payever-banner-and-rate .payever-rate .payever-activator-link.configured {cursor: pointer;}'
    ];
    return parentStyles + specificStyles.join('\n');
  }

  constructor(element: HTMLElement, effectiveRateWindow: any) {
    super(element, effectiveRateWindow);
    this.element = element;

    this.element.innerHTML = `
      <div class="payever-outer">
        <div class="payever-rate">
          ${this.payLink.getHTML('payever-link')}
          <div class="payever-heading">${window['Payever'].FinanceExpress.embedInstance.phrases.installment_checkout}</div>
          <div class="payever-fieldset">
            <div class="payever-form-table-row payever-monthly payever-activator-link">
              <div class="payever-text payever-form-table-label">${window['Payever'].FinanceExpress.embedInstance.phrases.payback_period}</div>
              <div class="payever-duration payever-text payever-form-table-control"></div>
            </div>
            <div class="payever-form-table-row">
              <div class=" payever-text payever-form-table-label">${window['Payever'].FinanceExpress.embedInstance.phrases.monthly_amount}</div>
              <select class="payever-period-select payever-text payever-form-table-control" data-no-fancy-select="true"></select>
            </div>
          </div>
          <div class="payever-footer">
            <span class="payever-total payever-text"></span><span class="payever-text">&nbsp;|&nbsp;</span><span class="payever-footer-effective-rate payever-text"></span><span class="payever-text"> | </span><span class="payever-footer-credit-cost payever-text"></span>
          </div>
        </div>
      </div>`;

    const effectiveRate: HTMLElement = this.element.querySelector('.payever-rate .payever-effective-rate');
    if (effectiveRate) {
      effectiveRate.addEventListener('click', this.effectiveRate);
    }

    this.activator = this.element.querySelector('.payever-activator-link');
    this.link = this.element.querySelector('.payever-link');
    this.activator.addEventListener('click', event => {
      // this.payLink.createFlow((flowData: any) => {
      //   this.payLink.goByLink(this.link);
      // });
      if (this.settings.linkTo) {
        return this.payLink.goByClickEvent(event);
      }
    });
    this.rateSelect = this.element.querySelector('.payever-rate .payever-period-select');
  }

  update(): void {
    let option;
    const url: string = this.payLink.url();
    this.activator.setAttribute('data-href', url);
    this.rates = this.getRates();

    for (let index = this.rateSelect.options.length - 1; index >= 0; index--) {
      option = this.rateSelect.options[index];
      this.rateSelect.remove(index);
    }

    for (let rate of this.rates) {
      option = document.createElement('option');
      option.innerHTML = rate.calculator_month_rate;
      this.rateSelect.appendChild(option);
    }

    this.rateSelect.addEventListener('change', () => this.setRate(this.rateSelect.selectedIndex));
    this.setRate(this.rateSelect.selectedIndex);

    if (this.payLink.isConfigured()) {
      addClass(this.activator, 'configured');
    } else {
      removeClass(this.activator, 'configured');
    }
  }

  setRate(index): void {
    const credit = this.rates[index];
    this.element.querySelector('.payever-rate .payever-duration').innerHTML = credit.calculator_duration;
    this.element.querySelector('.payever-rate .payever-total').innerHTML = credit.calculator_total;
    this.element.querySelector('.payever-rate .payever-footer-effective-rate').innerHTML = credit.calculator_effective_rate;
    this.element.querySelector('.payever-rate .payever-footer-credit-cost').innerHTML = credit.calculator_credit_cost;
  }
}
