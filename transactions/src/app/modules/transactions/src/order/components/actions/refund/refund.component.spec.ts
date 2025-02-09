import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { I18nModule, TranslateService } from '@pe/ng-kit/src/kit/i18n';
import { of, ReplaySubject, Subject } from 'rxjs';
import { DateFormatPipe, SettingsService } from '../../../../shared';
import { DetailService } from '../../../services';
import { ActionRefundComponent } from './refund.component';
import { WindowService } from '@pe/ng-kit/src/kit/window';
import { mockChartItem, mockOrder } from '../../../../../test-mocks';

describe('ActionRefundComponent', () => {
  let component: ActionRefundComponent;
  let fixture: ComponentFixture<ActionRefundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot({}),
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ActionRefundComponent],
      providers: [
        DateFormatPipe,
        {
          provide: DetailService,
          useValue: {
            getData: () => of(mockOrder),
            actionOrder: () => of({}),
          },
        },
        {
          provide: WindowService,
          useValue: {
            isMobile$: new Subject(),
          },
        },
        FormBuilder,
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: TranslateService,
          useValue: {},
        },
        {
          provide: Router,
          useValue: {},
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                actionId: 'authorize',
              },
              params: {
                orderId: 'testId',
                businessUuid: 'e9d4bfaa-b40e-427c-b0f6-c389610721fa',
                uuid: 'e9d4bfaa-b40e-427c-b0f6-c389610721fa',
              },
            },
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: (translationKey: string) => translationKey,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionRefundComponent);
    component = fixture.componentInstance;
    component['destroyed$'] = new ReplaySubject(1);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run on init method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should run onSubmit method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.onSubmit();
    expect(component).toBeTruthy();
  }));

  it('should run onChangeAmount method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['onChangeAmount']();
    expect(component).toBeTruthy();
  }));

  it('should run onChangeRefundDeliveryFee method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['onChangeRefundDeliveryFee']();
    expect(component).toBeTruthy();
  }));

  it('should run onChangeRefundPaymentFee method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['onChangeRefundPaymentFee']();
    expect(component).toBeTruthy();
  }));

  it('should run onChangeType method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['order']._itemsArray = {};
    component['order'].cart.available_refund_items.map((ri, i) => {
      component['order']._itemsArray[ri.item_uuid] =
        component['order'].cart.items[i];
    });

    component['onChangeType'](0);
    tick();

    component['onChangeType'](1);
    tick();

    component['onChangeType'](2);
    tick();

    expect(component).toBeTruthy();
  }));

  it('should run onChangeCount method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['order']._itemsArray = {};
    component['order'].cart.available_refund_items.map((ri, i) => {
      component['order']._itemsArray[ri.item_uuid] =
        component['order'].cart.items[i];
    });

    component['onChangeCount'](true);
    component['onChangeCount'](false);
    expect(component).toBeTruthy();
  }));

  it('should destroy without errors', () => {
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });
});
