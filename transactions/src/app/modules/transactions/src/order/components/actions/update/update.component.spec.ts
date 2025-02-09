import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { I18nModule, TranslateService } from '@pe/ng-kit/src/kit/i18n';
import { of, ReplaySubject, Subject } from 'rxjs';
import {
  DateFormatPipe,
  SettingsService,
  ApiService,
} from '../../../../shared';
import { DetailService } from '../../../services';
import { ActionUpdateComponent } from './update.component';
import { WindowService } from '@pe/ng-kit/src/kit/window';

describe('ActionUpdateComponent', () => {
  let component: ActionUpdateComponent;
  let fixture: ComponentFixture<ActionUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot({}),
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ActionUpdateComponent],
      providers: [
        DateFormatPipe,
        {
          provide: ApiService,
          useValue: {
            getBusinessData: () => of({ companyAddress: { country: '' } }),
          },
        },
        {
          provide: WindowService,
          useValue: {
            isMobile$: new Subject(),
          },
        },
        {
          provide: DetailService,
          useValue: {
            getData: () =>
              of({
                customer: { email: 'test@test.com' },
                payment_option: { type: '' },
                transaction: { amount: 5 },
                cart: { items: [] },
                shipping: { delivery_fee: '' },
              }),
            actionOrder: () => of({}),
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
    fixture = TestBed.createComponent(ActionUpdateComponent);
    component = fixture.componentInstance;
    component['destroyed$'] = new ReplaySubject(1);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should submit without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['onSubmit']();

    component.order._isSantanderNoInvoice = true;
    component['action'] = 'update';
    component['onSubmit']();
    expect(component).toBeTruthy();
  }));

  it('should onChangeUpdateData without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    spyOn(component.form, 'get').and.returnValue({
      value: {
        deliveryFee: 12,
        productLine: [{ price: 500, quantity: 100, vat_rate: 18 }],
      },
    } as any);
    component['onChangeUpdateData']();
    expect(component).toBeTruthy();
  }));

  it('should showValidationErrors without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['showValidationErrors']({
      error: {},
      errors: { message: 'test' },
    });
    component['showValidationErrors']({
      error: {},
      errors: { errors: ['test'] },
    });
    expect(component).toBeTruthy();
  }));

  it('should setValidationError without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['setValidationError'](1);
    component['setValidationError'](0);
    expect(component).toBeTruthy();
  }));

  it('should onClickAddItem without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.onClickAddItem({ preventDefault: () => {} } as any);
    expect(component).toBeTruthy();
  }));

  it('should onClickRemoveItem without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.onClickRemoveItem(0);
    expect(component).toBeTruthy();
  }));

  it('should vatRateValue without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.vatRateValue({ country: 'US', value: 5 });
    expect(component).toBeTruthy();
  }));
});
