import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { SettingsService, ApiService } from '../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { TableModule } from '@pe/ng-kit/src/kit/table';
import { DetailService } from '../../services';
import { mockFilters, mockOrder } from '../../../../test-mocks';

import { ActionsListComponent } from './actions-list.component';
import { SnackBarService, SnackBarModule } from '@pe/ng-kit/src/kit/snack-bar';
import { PaymentMethodEnum } from '@pe/checkout-sdk/sdk/types';

describe('ActionsListComponent', () => {
  let component: ActionsListComponent;
  let fixture: ComponentFixture<ActionsListComponent>;

  let store: Store<any>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot(),
        MatMenuModule,
        TableModule,
        SnackBarModule,
      ],
      declarations: [ActionsListComponent],
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
            params: of({
              orderId: 'rty876-876456hh-67jmju-iyuiok',
            }),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getFiltersCacheKey: () => 'browser-key',
            filters: mockFilters,
            externalUrls: {
              getSantanderContractUrl: (value: string) => value,
              getSantanderFactoringContractUrl: (value: string) => value,
              getSantanderInvoiceContractUrl: (value: string) => value,
              getSantanderDeQr: (value: string) => value,
            },
          },
        },
        {
          provide: SnackBarService,
          useValue: {
            toggle: () => {},
          },
        },
        {
          provide: DetailService,
          useValue: {
            checkSantanderStatus: () => of({}),
          },
        },
        {
          provide: ApiService,
          useValue: {},
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
    fixture = TestBed.createComponent(ActionsListComponent);
    component = fixture.componentInstance;
    component.order = mockOrder as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    expect(component).toBeTruthy();
  }));

  it('should call showError', () => {
    const spy = spyOn(TestBed.get(SnackBarService), 'toggle');
    component['showError']('');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should parseReferenceNumber without errors', () => {
    expect(component['parseReferenceNumber']('456782328762')).toEqual('');
    expect(component['parseReferenceNumber']('HK234-353fdsfds-sdfsa')).toEqual(
      ''
    );
  });

  it('should get proper action label without errors', () => {
    expect(component['getActionLabel']('test')).toBe('actions.test');
  });

  it('should showCreditAnswer without errors', () => {
    expect(component['showCreditAnswer']).toBe(false);
    component.order._showCreditAnswer = true;
    component.order.payment_option.type =
      PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
    expect(component['showCreditAnswer']).toBe(true);
    component.order._showSantanderDeQr = true;
    component.order.details.credit_answer = 'test-answer';
    expect(component['showCreditAnswer']).toBe(true);
    component.order._isSantander = true;
    component.order._hideUpdateStatusAction = false;
    expect(component['showCreditAnswer']).toBe(true);
    component.order._showSantanderContract = true;
    component.order._showSantanderFactoringContract = true;
    expect(component['showCreditAnswer']).toBe(true);
    component.order._showSantanderInvoiceContract = true;
    expect(component['showCreditAnswer']).toBe(true);
  });

  it('should prepareActionsForUI without error', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);

    component.order.payment_option.type = 'santander_ccp_installment' as any;
    component['prepareActionsForUI']();

    expect(component).toBeTruthy();
  }));

  it('should onClickCreditAnswerAction without error', fakeAsync(() => {
    const routerSpy = spyOn(TestBed.get(Router), 'navigate');

    component.onClickCreditAnswerAction();
    expect(routerSpy).toHaveBeenCalledTimes(1);
  }));

  it('should onClickOrderAction without error', fakeAsync(() => {
    const routerSpy = spyOn(TestBed.get(Router), 'navigate');

    component.onClickOrderAction('cancel');
    expect(routerSpy).toHaveBeenCalledTimes(1);
  }));

  it('should onClickCheckStatusAction without error', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    component.onClickCheckStatusAction();
    expect(component).toBeTruthy();
  }));

  it('should return proper santanderDeQrUrl without error', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    expect(component.santanderDeQrUrl).toBe(undefined);
  }));
});
