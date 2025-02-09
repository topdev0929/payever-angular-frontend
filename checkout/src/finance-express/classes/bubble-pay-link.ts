/* tslint:disable */
import { PayLink } from './pay-link';

export class BubblePayLink extends PayLink {

  constructor(settings: any, context: any) {
    super(settings, context, 'bubble');
  }

  title(): any {
    if (this.settings.linkTo === 'finance_calculator') {
      return window['Payever'].FinanceExpress.embedInstance.phrases.bubble_finance_calculator;
    } else {
      return window['Payever'].FinanceExpress.embedInstance.phrases.bubble_finance_express;
    }
  }

}
