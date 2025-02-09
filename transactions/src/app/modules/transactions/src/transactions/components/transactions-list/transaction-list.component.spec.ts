import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { WindowService } from '@pe/ng-kit/src/kit/window';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of, Subject } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { Store } from '@ngrx/store';
import { PlatformService } from '@pe/ng-kit/src/kit/common';

import { TransactionsListComponent } from './transactions-list.component';
import {
  SettingsService,
  HeaderService,
  ApiService,
  ListInterface,
  FiltersOptionsSourcesType,
} from '../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { TableModule } from '@pe/ng-kit/src/kit/table';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { IconsService } from '../../services';
import { mockColumns, mockFilters } from '../../../../test-mocks';
import { DataGridFilterInterface } from '@pe/ng-kit/src/kit/data-grid';

describe('TransactionsListComponent', () => {
  let component: TransactionsListComponent;
  let fixture: ComponentFixture<TransactionsListComponent>;

  let store: Store<any>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot(),
        MatMenuModule,
        TableModule,
      ],
      declarations: [TransactionsListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
              params: {
                uuid: 'rty876-876456hh-67jmju-iyuiok',
              },
            },
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getFiltersCacheKey: () => 'browser-key',
            filters: mockFilters,
          },
        },
        {
          provide: PlatformService,
          useValue: {
            microAppReady$: of(false),
            backToDashboard$: of(true),
          },
        },
        {
          provide: Store,
          useValue: {
            select: () => of([]),
            dispatch: () => {},
          },
        },
        {
          provide: LocalStorageService,
          useValue: {
            clear: () => {},
            store: () => {},
          },
        },
        {
          provide: HeaderService,
          useValue: {
            setShortHeader: () => {},
            destroyShortHeader: () => {},
          },
        },
        {
          provide: PlatformHeaderService,
          useValue: {},
        },
        {
          provide: WindowService,
          useValue: {
            isMobile$: of(true),
            isIpad$: of(false),
            isTablet$: of(false),
            isDesktopLg$: of(false),
          },
        },
        {
          provide: ApiService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => true,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => {},
            url: 'test-url',
          },
        },
        IconsService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsListComponent);
    component = fixture.componentInstance;
    component.columns$ = of(mockColumns);
    component.activeFilters$ = of(mockFilters);
    component.items$ = of([] as any);

    store = TestBed.get(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    expect(component).toBeTruthy();
  }));

  it('should hideSpecificStatus without errors', () => {
    let mockItem: ListInterface;
    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe(null);

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'santander_factoring_de',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe(null);

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'santander_pos_factoring_de',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe(null);

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'santander_invoice_de',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe(null);

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'santander_pos_invoice_de',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe(null);

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'paypal',
      specific_status: 'test-status',
    } as ListInterface;
    component['hideSpecificStatus'](mockItem);
    expect(mockItem.specific_status).toBe('test-status');
  });

  it('should setColor without errors', () => {
    let mockItem: ListInterface;
    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
      status: 'STATUS_ACCEPTED',
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('green');

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
      status: 'STATUS_PAID',
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('green');

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
      status: 'STATUS_FAILED',
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('red');

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
      status: 'STATUS_CANCELLED',
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('red');

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
      status: 'STATUS_DECLINED',
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('red');

    mockItem = {
      uuid: '67890jh-sdf876-d87656sd-987654s',
      type: 'sofort',
      specific_status: 'test-status',
      _statusColor: null,
    } as ListInterface;
    component['setColor'](mockItem);
    expect(mockItem._statusColor).toBe('yellow');
  });

  it('should updateFiltersSchema without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');

    component.ngOnInit();
    tick(1000);

    component['updateFiltersSchema']();
    // dispatch is called once in onInit method and once in updateFiltersSchema
    expect(storeDispatchSpy).toHaveBeenCalledTimes(2);
  }));

  it('should getOptions without errors', fakeAsync(() => {
    const storeSelectSpy = spyOn(store, 'select');

    storeSelectSpy.and.returnValue(of(mockFilters));

    // call select 1
    component['getOptions'](FiltersOptionsSourcesType.Channels);
    // call select 2
    component['getOptions'](FiltersOptionsSourcesType.Currencies);
    // call select 3
    component['getOptions'](FiltersOptionsSourcesType.PaymentMethods);
    // call select 4
    component['getOptions'](FiltersOptionsSourcesType.Statuses);
    // call select 5
    component['getOptions'](FiltersOptionsSourcesType.SpecificStatuses);
    // call select 6
    component['getOptions'](FiltersOptionsSourcesType.Stores);
    // should not call select
    component['getOptions'](null);

    expect(storeSelectSpy).toHaveBeenCalledTimes(6);
  }));

  it('should getColumns without errors', fakeAsync(() => {
    component['getColumns'](mockColumns);
    expect(JSON.stringify(component['getColumns'](mockColumns))).toBe(
      JSON.stringify([
        "channel",
        "original_id",
        "total"
      ])
    );
  }));

  it('should getChannelIconId without errors', fakeAsync(() => {
    expect(component.getChannelIconId('facebook')).toBe(
      '#icon-channel-facebook'
    );
  }));

  it('should getPaymentMethodIconId without errors', fakeAsync(() => {
    expect(component.getPaymentMethodIconId('cash')).toBe(
      '#icon-payment-option-wire-transfer'
    );
  }));

  it('should getTransactions without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');
    component.getTransactions(1);
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTruthy();
  }));

  it('should openTransaction without errors', fakeAsync(() => {
    const router = TestBed.get(Router);
    const routerSpy = spyOn(router, 'navigate');
    component.openTransaction('ejwewe-2323-wdewd322-3fwfwe');
    expect(routerSpy).toHaveBeenCalledTimes(1);
  }));

  it('should onLoadMore without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');
    component.onLoadMore();
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
  }));

  it('should onFilterAdded without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');
    component.onFilterAdded({} as DataGridFilterInterface);
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTruthy();
  }));

  it('should onRowClick without errors', fakeAsync(() => {
    const router = TestBed.get(Router);
    const routerSpy = spyOn(router, 'navigate');

    // should navigate
    component.isMobile = true;
    component.onRowClick({});
    // should not navigate
    component.isMobile = false;
    component.onRowClick({});

    expect(routerSpy).toHaveBeenCalledTimes(1);
  }));

  it('should toggleSortDirection without errors', fakeAsync(() => {
    let sort = {
      active: 'test',
      direction: 'asc',
    };

    component.toggleSortDirection(sort as any);
    expect(sort.direction).toBe('desc');

    component.toggleSortDirection(sort as any);
    expect(sort.direction).toBe('asc');
  }));

  it('should onDropdownSort without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');
    let sort = {
      active: 'test',
      direction: 'asc',
      label: 'date',
    } as any;

    component.activeSort = sort;

    component.onDropdownSort(sort);
    expect(sort.direction).toBe('desc');
    expect(component.activeSort.direction).toBe('desc');
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTruthy();
  }));

  it('should onSort without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');
    let sort = {
      active: 'test',
      direction: 'asc',
      label: 'date',
    } as any;

    component.onSort(sort);
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTruthy();
  }));

  it('should onSearch without errors', fakeAsync(() => {
    const storeDispatchSpy = spyOn(store, 'dispatch');

    component.onSearch('test');
    expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTruthy();
  }));

  it('should execute on destroy without errors', fakeAsync(() => {
    component.ipadColumns;
    component.mobileColumns;
    component.ngOnDestroy();
    spyOn(TestBed.get(AuthService), 'isAdmin').and.returnValue(false);
    component.ipadColumns;
    component.mobileColumns;
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));
});
