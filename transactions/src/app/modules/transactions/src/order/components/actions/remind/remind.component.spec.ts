import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { I18nModule, TranslateService } from '@pe/ng-kit/src/kit/i18n';
import { of, ReplaySubject, throwError } from 'rxjs';
import { DateFormatPipe, SettingsService } from '../../../../shared';
import { DetailService } from '../../../services';
import { ActionRemindComponent } from './remind.component';

describe('ActionRemindComponent', () => {
  let component: ActionRemindComponent;
  let fixture: ComponentFixture<ActionRemindComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot({})],
      declarations: [ActionRemindComponent],
      providers: [
        DateFormatPipe,
        {
          provide: DetailService,
          useValue: {
            getData: () =>
              of({
                customer: { email: 'test@test.com' },
                payment_option: { type: '' },
                transaction: { amount: 5 },
              }),
            actionOrder: () => of({}),
          },
        },
        {
          provide: FormBuilder,
          useValue: {
            group: () => of({ get: () => ({ value: 5 }) }),
          },
        },
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
    fixture = TestBed.createComponent(ActionRemindComponent);
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

  it('should set proper values on init method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component['orderId']).toBe('testId');
    expect(component['order'].customer.email).toBe('test@test.com');
  }));

  it('should build a form after data is fetched on init method without errors', fakeAsync(() => {
    const formBuilder = TestBed.get(FormBuilder);
    const formBuilderSpy = spyOn(formBuilder, 'group');

    component.ngOnInit();
    tick();

    expect(formBuilderSpy).toHaveBeenCalled();
    expect(formBuilderSpy).toHaveBeenCalledTimes(1);
  }));

  it('should submit form without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.form = { get: () => ({ value: 5 }) } as any;
    component.onSubmit();
    expect(component).toBeTruthy();
  }));

  it('should handle errors on submit', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.form = { get: () => ({ value: 5 }) } as any;
    component.modalButtons = [];
    component['detailService'].actionOrder = (
      orderId: string,
      data: any,
      action: any
    ) => throwError({ status: 404 });
    component.onSubmit();
    expect(component).toBeTruthy();
  }));

  it('should destroy without errors', () => {
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });
});
