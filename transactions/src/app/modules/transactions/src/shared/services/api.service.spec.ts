import { TestBed, fakeAsync } from '@angular/core/testing';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { ExportFormats } from '../../transactions/common/entries';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [I18nModule.forRoot({})],
      providers: [
        ApiService,
        {
          provide: SettingsService,
          useValue: {
            getApiGetOrderDetailsUrl: () => of({}),
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
            apiAppBaseUrl$: of([]),
            apiGetListUrl: '',
            getBusinessDataUrl: () => '',
          },
        },
        {
          provide: HttpClient,
          useValue: {
            get: (value: any) => of({}),
            post: () => of({}),
            put: () => of({}),
          },
        },
      ],
    })
  );

  beforeEach(() => {
    service = TestBed.get(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getTransactionDetails without errors', () => {
    service.getTransactionDetails('TEST');
    expect(service).toBeTruthy();
  });

  it('should getTransactions without errors', () => {
    service.getTransactions({});
    expect(service).toBeTruthy();
  });

  it('should exportTransactions without errors', () => {
    service.exportTransactions(ExportFormats.CSV, [], 'test', {});
    expect(service).toBeTruthy();
  });

  it('should getTransactionsListColumns without errors', () => {
    service.getTransactionsListColumns();
    expect(service).toBeTruthy();
  });

  it('should getBusinessData without errors', () => {
    service.getBusinessData();
    expect(service).toBeTruthy();
  });

  it('should getCurrencies without errors', () => {
    service.getCurrencies();
    expect(service).toBeTruthy();
  });

  it('should putTransactionsListColumns without errors', () => {
    service.putTransactionsListColumns([]);
    expect(service).toBeTruthy();
  });

  it('should getSearchParams without errors', () => {
    service['getSearchParams']({
      orderBy: 'amount',
      direction: 'desc',
      configuration: {
        test: {
          condition: 'isNotIn',
          value: 'test',
        },
        test1: {
          condition: 'is',
          value: 'test',
        },
        test2: {
          condition: 'contains',
          value: 'test',
        },
      },
      search: '',
      page: 1,
      currency: '',
    });
    expect(service).toBeTruthy();
  });

  it('should execute isFilterQuery without error', () => {
    service['isFilterQuery']('orderBy');
    expect(service).toBeTruthy();
  });
});
