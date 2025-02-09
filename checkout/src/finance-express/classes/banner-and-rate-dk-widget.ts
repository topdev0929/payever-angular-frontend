/* tslint:disable */
import { BannerAndRateWidgetGeneral } from './banner-and-rate-general-widget';

export class BannerAndRateDKWidget extends BannerAndRateWidgetGeneral {

  static dynamicStyleSheet() {
    const parentStyles = super.dynamicStyleSheet();
    const specificStyles = [
      '.payever-finance-express.payever-banner-and-rate .payever-banner{display:inline-block;}',
      '.payever-finance-express.payever-banner-and-rate .payever-rate{display:none;}'
    ];
    return parentStyles + specificStyles.join("\n");
  }

  // TODO check second param
  constructor(element: HTMLElement) {
    super(element, null);
    this.element = element;
  }
}
