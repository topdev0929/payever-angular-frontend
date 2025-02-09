import { Observable, of, Subscription } from 'rxjs';

export const widgetId = 'b2ffec8a-1387-481f-9f0a-d3ae2528006c';
export const checkoutUuid = '8ba1ac7e-9506-5a64-98b6-f0e4e22833e2';
export const buisenessUiid = 'e17417c2-e09b-41e5-a881-669e9bef49b7';
export const commerceosUrl = 'https://commerceos.test.devpayever.com';

export class PayeverPaymentWidgetLoaderStub {

  private envJson = null;
  private loadedScripts: {[key: string]: boolean} = {};
  private elems = [];
  private logsEnabled = false;
  private elementChangesSub$: Subscription;

  init() {}
  loadWidget() {}
  loadWidgetConfig() {}
  getPaymentMethodByAmount() { return null; }
  loadWidgetRoot() {}
  loadWidgetWebComponent() {}
  loadCheckoutWrapperWebComponent() {}
  loadWrapperStyles() {}
  loadEnvJson() {}
  loadScript() {}
  request() {}
  isStatus200() { return null; }
  log() {}
  restoreWidgetElementConfigCase() { return null; }
  setConfigToElem() {}
  readElemDatasetAsCustomWidgetConfig() { return null; }
  checkElementsDatasetChangesAndUpdate() {}
  unsubscribeChangeDetectionSub() {}
}

export const env = {
  frontend: {
    checkoutWrapper: 'https://checkout.test.devpayever.com',
    paymentOptionsSantanderDe: 'https://payment-santander-de-frontend.test.devpayever.com',
    paymentOptionsSantanderDeFact: 'https://payment-santander-de-fact-frontend.test.devpayever.com',
    paymentOptionsSantanderDk: 'https://payment-santander-dk-frontend.test.devpayever.com',
    paymentOptionsSantanderSe: 'https://payment-santander-se-frontend.test.devpayever.com',
    paymentOptionsSantanderNo: 'https://payment-santander-no-frontend.test.devpayever.com',
    commerceos: 'https://commerceos.test.devpayever.com'
  },
  backend: {
    financeExpress: 'https://finance-express-backend.test.devpayever.com'
  },
  custom: {
    cdn: 'https://payevertest.azureedge.net'
  }
};

export class StorageServiceStub {
  businessUuid = buisenessUiid;

  getCheckoutByIdOnce(checkoutId: string): Observable<any> {
    return of({});
  }

  getPaymentOptions(checkoutId: string) {
    return of(paymentOptions);
  }

  getIntegrationsInfoOnce() {
    return of(integrations);
  }
}

export class ApiServiceStub {
  getChannelSets() {
    return of(channelSets);
  }

  getWidgetSettingsById() {
    return of(widgetSettings);
  }

  saveWidgetSettings() {
    return of(null);
  }
}

export class HeaderServiceStub {
  setShortHeader() {
  }
}

export class TranslateServiceStub {
  translate(string: string) {
    return string;
  }
}

export const channelSets = [
  {
    checkout: checkoutUuid,
    id: '77ae0b38-f421-4d48-8358-1a9dbb049046',
    policyEnabled: true,
    type: 'finance_express'
  },
  {
    checkout: checkoutUuid,
    id: '8038e3f9-0849-4a96-aadf-4197fbe366ed',
    policyEnabled: true,
    type: 'link'
  },
  {
    checkout: checkoutUuid,
    id: 'b206661e-b5f0-4227-b7d1-e4b5358ed7f3',
    name: 'DE1',
    policyEnabled: true,
    type: 'shop'
  }
];

export const widgetSettings = {
  amountLimits: {
    max: 5000,
    min: 20
  },
  ratesOrder: 'desc',
  channelSet: '840a8864-c5fc-4b58-914d-55275c61979b',
  checkoutMode: 'financeExpress',
  checkoutPlacement: 'rightSidebar',
  isBNPL: false,
  isVisible: true,
  minWidth: 380,
  maxWidth: 500,
  payments: [
    {
      amountLimits: {
        min: 20,
        max: 750
      },
      paymentMethod: 'santander_factoring_de'
    }
  ],
  styles: {
    backgroundColor: '#ffffff',
    buttonColor: '#ffffff',
    fieldBackgroundColor: '#ffffff',
    fieldLineColor: '#d7d7d7',
    fieldArrowColor: '#555555',
    headerTextColor: '#000000',
    lineColor: '#dddddd',
    mainTextColor: '#000000',
    regularTextColor: '#737373',
    ctaTextColor: '#737373',
  },
  type: 'dropdownCalculator',
  _id: 'b2ffec8a-1387-481f-9f0a-d3ae2528006c',
};

export const paymentOptions = [
  {
    id: 8,
    min: 99,
    max: 100000,
    payment_method: 'santander_installment',
  },
  {
    id: 231,
    min: 20,
    max: 750,
    payment_method: 'santander_factoring_de',
  },
  {
    id: 10,
    min: 186.1501,
    max: 7483.4195,
    payment_method: 'santander_installment_no',
  },
  {
    id: 13,
    min: 201.418,
    max: 13427.8655,
    payment_method: 'santander_installment_dk',
  },  {
    id: 16,
    min: 52.866,
    max: 9790.0044,
    payment_method: 'santander_installment_se',
  }
];

export const integrations = [
  {
    enabled: false,
    installed: true,
    integration: {
      name: 'button',
      displayOptions: {
        icon: '#icon-ep-button-16',
        title: 'channelsList.button'
      }
    }
  },
  {
    enabled: true,
    installed: true,
    integration: {
      name: 'santander_factoring_de',
      displayOptions: {
        icon: '#icon-payment-option-santander',
        title: 'integrations.payments.santander_factoring_de.title'
      }
    }
  },
  {
    enabled: true,
    installed: true,
    integration: {
      name: 'santander_invoice_de',
      displayOptions: {
        icon: '#icon-payment-option-santander',
        title: 'integrations.payments.santander_invoice_de.title'
      }
    }
  },
  {
    enabled: true,
    installed: true,
    integration: {
      name: 'santander_installment',
      displayOptions: {
        icon: '#icon-payment-option-santander',
        title: 'integrations.payments.santander_installment.title'
      }
    }
  }
];
