import { FinanceExpressConfigInterface } from '../interfaces/index';

export class FinanceExpressConfig {

  static getConfig(): FinanceExpressConfigInterface {
    return window['Payever'] ? window['Payever'].financeExpressConfig : {};
  }

  static setConfig(config: FinanceExpressConfigInterface) {
    return window['Payever'].financeExpressConfig = config;
  }

}
