import { TestBed, fakeAsync } from '@angular/core/testing';

import { DetailService } from './detail.service';
import { of, Subject, throwError } from 'rxjs';
import {
  DetailInterface,
  SettingsService,
  OrderHistoryInterface,
  ActionRequestRefundItemsInterface,
  ItemInterface,
  ActionInterface,
  RefundItemsInterface,
} from '../../shared';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/src/kit/environment-config';
import { HttpClient } from '@angular/common/http';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { Router, ActivatedRoute } from '@angular/router';

import { mockOrder, mockActionRequest } from '../../../test-mocks';

describe('DetailService', () => {
  let service: DetailService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [I18nModule.forRoot({})],
      providers: [
        DetailService,
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: EnvironmentConfigService,
          useValue: {},
        },
        EnvironmentConfigService,
        {
          provide: HttpClient,
          useValue: {
            get: (value: any) => of(mockOrder),
            post: () => of({}),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getApiGetOrderDetailsUrl: () => of(mockOrder),
            apiBusinessUrls: {
              apiGetOrderPaymentUrl: () => '',
              postActionUrl: () => '',
            },
            externalUrls: {
              getBusinessVatUrl: () => '',
              getSantanderCheckStatusUrl: () => '',
            },
            settings: {
              constants: {
                SANTANDER_DE_POS_SHOW_CREDIT_ANSWER_TIMEOUT: 8,
              },
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => {},
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    })
  );

  beforeEach(() => {
    service = TestBed.get(DetailService);
    service['businessVatCashed'] = [];
    service['businessVatObservable'] = of([]);
    service['orderId'] = 'trst';
    service['order'] = mockOrder as DetailInterface;
    service['order$'] = of(mockOrder as DetailInterface);
    service['orderPaymentId'] = null;
    service['orderPayment'] = null;
    service['orderPayment$'] = of(null);
    service['resetSubject$'] = new Subject<boolean>();
    service['loadingSubject$'] = new Subject<boolean>();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data without errors', fakeAsync(() => {
    const settingsService = TestBed.get(SettingsService);
    const settingServiceSpy = spyOn(
      settingsService,
      'getApiGetOrderDetailsUrl'
    ).and.returnValue(of(mockOrder));
    const httpService = TestBed.get(HttpClient);
    const httpServiceSpy = spyOn(httpService, 'get');
    httpServiceSpy.and.returnValue(of(mockOrder));
    service.getData('', 'orderId', true);
    httpServiceSpy.and.returnValue(throwError({ status: 403 }));
    service.getData('', '', false);

    expect(service).toBeTruthy();
    expect(settingServiceSpy).toHaveBeenCalledTimes(2);
    expect(httpServiceSpy).toHaveBeenCalledTimes(2);
  }));

  it('should getOrderPayment without errors', fakeAsync(() => {
    const settingsService = TestBed.get(SettingsService);
    spyOn(settingsService, 'apiBusinessUrls').and.returnValue({});
    const httpService = TestBed.get(HttpClient);
    service.getOrderPayment('', false);

    spyOn(httpService, 'get').and.returnValue(throwError({}));
    service.getOrderPayment('', true);

    expect(service).toBeTruthy();
  }));

  it('should actionOrder without errors', fakeAsync(() => {
    const httpService = TestBed.get(HttpClient);
    service.actionOrder('', mockActionRequest, 'update', 'amount', false);

    spyOn(httpService, 'post').and.returnValue(throwError({}));
    service.actionOrder('', mockActionRequest, 'cancel', 'amount', true);

    expect(service).toBeTruthy();
  }));

  it('should actionOrderUpload without errors', fakeAsync(() => {
    const httpService = TestBed.get(HttpClient);
    service.actionOrder('', {}, 'cancel', '', false);

    spyOn(httpService, 'post').and.returnValue(throwError({}));
    service.actionOrder('', {}, 'cancel', '', true);

    expect(service).toBeTruthy();
  }));

  it('should checkSantanderStatus without errors', fakeAsync(() => {
    const httpService = TestBed.get(HttpClient);
    service.actionOrder('', {}, 'cancel', '', false);

    spyOn(httpService, 'get').and.returnValue(throwError({}));
    service.actionOrder('', {}, 'cancel', '', true);

    expect(service).toBeTruthy();
  }));

  it('should compileData without errors', fakeAsync(() => {
    service['compileData']();

    expect(service).toBeTruthy();
  }));

  it('should makeItemsArray without errors', () => {
    service['makeItemsArray']();
    expect(service).toBeTruthy();
  });

  it('should initOrderPaymentType without errors', fakeAsync(() => {
    service['order'].payment_option.type = 'cash' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'payex_creditcard' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'paymill_creditcard' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'paypal' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'sofort' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'stripe' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'santander_invoice_de' as any;
    service['initOrderPaymentType']();

    service['order'].payment_option.type = 'santander_invoice_no' as any;
    service['initOrderPaymentType']();

    expect(service).toBeTruthy();
  }));

  it('should initSantander without errors', fakeAsync(() => {
    service['order'].payment_option.type = 'santander_installment' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_installment_at' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_installment_dk' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_installment_no' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_invoice_no' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_installment_se' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_invoice_de' as any;
    service['initSantander']();

    service['order'].payment_option.type = 'santander_pos_factoring_de' as any;
    service['initSantander']();

    expect(service).toBeTruthy();
  }));

  it('should rebuildOrders without errors', fakeAsync(() => {
    service['rebuildOrders']();

    expect(service).toBeTruthy();
  }));

  it('should getCurrentTimeout without errors', fakeAsync(() => {
    service['getCurrentTimeout']({
      created_at: '' + Date.now(),
    } as OrderHistoryInterface);

    expect(service).toBeTruthy();
  }));

  it('should makeFormData without errors', () => {
    service['makeFormData']({ transaction: mockActionRequest });
    expect(service).toBeTruthy();
  });
});
