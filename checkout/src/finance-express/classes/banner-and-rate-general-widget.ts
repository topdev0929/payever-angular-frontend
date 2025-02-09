/* tslint:disable */
import { BannerAndRatesWidgetSettingsInterface } from '../../modules/checkout/src/interfaces';
import { AbstractWidget } from './abstract-widget';

export class BannerAndRateWidgetGeneral extends AbstractWidget {

  rateSelect: HTMLSelectElement; // HTMLElement;
  effectiveRateWindow: any;
  rates: {
    calculator_duration: string;
    calculator_pay_in: string;
    calculator_legal_info_text: string;
    calculator_total: string;
    calculator_month_rate: string;
    calculator_effective_rate: string;
    calculator_credit_cost: string;
  }[];

  /**
   * @deprecated
   */
  static initClass() {
    // effectiveRateWindow = null;
  }

  /**
   * @deprecated
   */
  static calcWidth() {
    const settings: BannerAndRatesWidgetSettingsInterface = this.prototype.settings;
    return super.calcWidth(settings.size);
  }

  /**
   * @deprecated
   */
  static hasBanner() {
    const settings: BannerAndRatesWidgetSettingsInterface = this.prototype.settings;
    return ['banner', 'banner_rate'].indexOf((settings.displayType)) > -1;
  }

  /**
   * @deprecated
   */
  static hasRate() {
    const settings: BannerAndRatesWidgetSettingsInterface = this.prototype.settings;
    return ['rate', 'banner_rate'].indexOf(settings.displayType) > -1;
  }

  /**
   * @deprecated
   */
  static calcDirection() {
    const settings: BannerAndRatesWidgetSettingsInterface = this.prototype.settings;
    switch (settings.labelPlacement) {
      case 'left': return 'left';
      case 'right': return 'right';
      case 'bottom': return 'none';
    }
  }

  static dynamicStyleSheet() {
    const settings: BannerAndRatesWidgetSettingsInterface = this.prototype.settings;
    const styles = [
      `.payever-finance-express.payever-banner-and-rate.payever-widget{width:${this.calcWidth()}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-text{color:${settings.textColor}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-heading{color:${settings.textColor}; font-size: 1.3em; margin-bottom: 5.5px;}`,
      `.payever-finance-express.payever-banner-and-rate .payever-legal-info{color:${settings.textColor}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-link{color:${settings.linkColor}}`,
      `.payever-finance-express.payever-banner-and-rate .paever-banner-border{background-color:${settings.bgColor} !important}`,
      `.payever-finance-express.payever-banner-and-rate .payever-border-color{border-color:${settings.borderColor}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-outer > div{width:${true || (settings.labelPlacement === 'bottom') || (settings.displayType !== 'banner_rate') ? '100' : '50'}%}`,
      `.payever-finance-express.payever-banner-and-rate .payever-banner{background-color: ${settings.bgColor}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-rate{float:${this.calcDirection()}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-rate .payever-amount{background:${settings.buttonColor};border:1px solid ${settings.borderColor}}`,
      `.payever-finance-express.payever-banner-and-rate .payever-rate .payever-dropdown{border-color:${settings.borderColor};border-style:solid;border-width:0 1px 1px 1px;}`,
      '.payever-finance-express.payever-banner-and-rate .payever-banner{display:none}',
      `.payever-finance-express.payever-banner-and-rate .payever-rate{display:${this.hasRate() ? 'block' : 'none'};}`,
      `.payever-finance-express .payever-form-table-row{border-color: transparent ${settings.borderColor} ${settings.borderColor} transparent;}`,
      `.payever-finance-express .payever-fieldset{background-color:${settings.bgColor}; box-shadow: inset 0 0 0 1px ${settings.borderColor};}`
    ];
    return styles.join("\n");
  }

  constructor(element: HTMLElement, effectiveRateWindow: any) {
    super(element);

    this.effectiveRateWindow = effectiveRateWindow;
    this.element = element;

    this.element.innerHTML = `
      <div class="payever-outer">
        <div class="payever-banner">
          <div>
            <div class="payever-border-color">
                ${this.payLink.getHTML('payever-duration payever-dropdown payever-link')}
                <div class="paever-banner-border paever-border-top"></div>
                <div class="paever-banner-border paever-border-right"></div>
                <div class="paever-banner-border paever-border-bottom"></div>
                <div class="paever-banner-border paever-border-left"></div>
            </div>
          </div>
          <div class='payever-legal-info payever-text'></div>
        </div>
      
        <div class="payever-rate">
          <div class="payever-amount">
            <div class="payever-monthly-text payever-text">${window['Payever'].FinanceExpress.embedInstance.phrases.monthly_amount}</div>
            ${this.payLink.getHTML('payever-monthly payever-text')}
          </div>
          <select class="payever-duration payever-dropdown payever-text" data-no-fancy-select="true"></select>
          <div class="payever-footer">
            <span class="payever-total payever-text"></span>
          </div>
        </div>
      </div>`;

    const effectiveRate: HTMLElement = this.element.querySelector('.payever-rate .payever-effective-rate');
    if (effectiveRate) {
      effectiveRate.addEventListener('click', this.effectiveRate);
    }
    this.payLink.addEventListener('.payever-banner .payever-duration,.payever-rate .payever-monthly');
    this.rateSelect = this.element.querySelector('.payever-rate .payever-duration');
  }

  effectiveRate(event): void {
    event.preventDefault();
    if ((this.effectiveRateWindow == null) || this.effectiveRateWindow.closed) {
      const a: HTMLLinkElement = event.currentTarget;
      this.effectiveRateWindow = window.open(a.href, a.target, 'resizable,scrollbars,status,width=820,height=960');
    } else {
      this.effectiveRateWindow.focus();
    }
  }

  initType(): void {
    this.type = 'banner-and-rate';
  }

  update(): void {
    let option;
    const url: string = this.payLink.url();
    const title: string = this.payLink.title();
    this.element.querySelector('.payever-duration.payever-link').setAttribute('href', url);
    this.element.querySelector('.payever-monthly.payever-text').setAttribute('href', url);
    this.element.querySelector('.payever-duration.payever-link').setAttribute('title', title);
    this.element.querySelector('.payever-monthly.payever-text').setAttribute('title', title);
    this.rates = this.getRates();

    for (let index = this.rateSelect.options.length - 1; index >= 0; index--) {
      option = this.rateSelect.options[index];
      this.rateSelect.remove(index);
    }

    for (let rate of this.rates) {
      option = document.createElement('option');
      option.innerHTML = rate.calculator_duration;
      this.rateSelect.appendChild(option);
    }

    this.rateSelect.addEventListener('change', () => this.setRate(this.rateSelect.selectedIndex));
    return this.setRate(this.rateSelect.selectedIndex);
  }

  setRate(index): void {
    const credit = this.rates[index];
    if (credit) {
      this.element.querySelector('.payever-banner .payever-duration').innerHTML = credit.calculator_pay_in || '';
      this.element.querySelector('.payever-banner .payever-legal-info').innerHTML = credit.calculator_legal_info_text || '';
      this.element.querySelector('.payever-rate .payever-monthly').innerHTML = credit.calculator_month_rate || '';
      this.element.querySelector('.payever-rate .payever-total').innerHTML = credit.calculator_total || '';
    }
  }

  getRates() {
    const rates = this.content.messages.banner_and_rate_split.slice(0);
    const settings: BannerAndRatesWidgetSettingsInterface = this.settings;
    if (settings.order === 'asc') {
      rates.reverse();
    }
    return rates;
  }
}
