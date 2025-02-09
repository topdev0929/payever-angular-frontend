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
import { of, Subject, ReplaySubject } from 'rxjs';

import { DetailsComponent } from './details.component';
import { DetailService, IconsService } from '../../services';
import { HeaderService, SettingsService } from '../../../shared';
import { AddressService } from '@pe/ng-kit/src/kit/address';
import { mockOrder } from '../../../../test-mocks';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  let headerService: HeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot()],
      declarations: [DetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orderId: 'orderId',
              uuid: '456dss32-dsdfs6sdf-434nshd-433nbbgds',
            }),
          },
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: AddressService,
          useValue: {},
        },
        IconsService,
        {
          provide: DetailService,
          useValue: {
            loading$: of(false),
            reset$: of({}),
            getData: () => of(mockOrder),
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
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => {},
            url: 'test-url',
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    component['destroyed$'] = new ReplaySubject(0);
    headerService = TestBed.get(HeaderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should get proper icon status', () => {
    expect(component.statusIcon('STATUS_NEW')).toBe('pending');
    expect(component.statusIcon('STATUS_IN_PROCESS')).toBe('pending');
    expect(component.statusIcon('STATUS_IN_PROCESS')).toBe('pending');

    expect(component.statusIcon('STATUS_ACCEPTED')).toBe('ok');
    expect(component.statusIcon('STATUS_PAID')).toBe('ok');

    expect(component.statusIcon('STATUS_DECLINED')).toBe('minus');
    expect(component.statusIcon('STATUS_FAILED')).toBe('minus');
    expect(component.statusIcon('STATUS_CANCELLED')).toBe('minus');

    expect(component.statusIcon('STATUS_REFUNDED')).toBe('return');

    expect(component.statusIcon(null)).toBe('');
  });

  it('should updateOrderStatusColor without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.order.status.general = 'STATUS_ACCEPTED';
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('green');

    component.order.status.general = 'STATUS_PAID';
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('green');

    component.order.status.general = 'STATUS_FAILED';
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('red');

    component.order.status.general = 'STATUS_CANCELLED';
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('red');

    component.order.status.general = 'STATUS_DECLINED';
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('red');

    component.order.status.general = null;
    component['updateOrderStatusColor']();
    expect(component.order._statusColor).toBe('yellow');
  }));

  it('should getBusinessData without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['getBusinessData']();
    expect(component).toBeTruthy();
  }));

  it('should updateOrder without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['updateOrder'](mockOrder as any);
    expect(component).toBeTruthy();
  }));

  it('should getPaymentMethodIconId without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.getPaymentMethodIconId('paypal');
    expect(component).toBeTruthy();
  }));

  it('should getPaymentMethodIconId without errors', () => {
    expect(component.getPaymentMethodIconId('paypal')).toBeTruthy(
      '#icon-payment-option-payall'
    );
  });

  it('should getPaymentMethodName without errors', () => {
    expect(component.getPaymentMethodName('paypal')).toBeTruthy(
      `integrations.payments.paypal.title`
    );
  });

  it('should getChannelIconId without errors', () => {
    expect(component.getChannelIconId('facebook')).toBeTruthy(
      `#icon-channel-facebook`
    );
  });
});
