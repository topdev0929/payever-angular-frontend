import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { I18nModule, TranslateService } from '@pe/ng-kit/src/kit/i18n';
import { of, ReplaySubject } from 'rxjs';
import { DateFormatPipe, SettingsService } from '../../../../shared';
import { DetailService } from '../../../services';
import { ActionCreditAnswerComponent } from './credit-answer.component';
import { mockOrder } from '../../../../../test-mocks';
import { FormModule } from '@pe/ng-kit/src/kit/form';

describe('ActionCreditAnswerComponent', () => {
  let component: ActionCreditAnswerComponent;
  let fixture: ComponentFixture<ActionCreditAnswerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot({}),
        FormModule,
        ReactiveFormsModule,
      ],
      declarations: [ActionCreditAnswerComponent],
      providers: [
        DateFormatPipe,
        {
          provide: DetailService,
          useValue: {
            getData: () => of(mockOrder),
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
    fixture = TestBed.createComponent(ActionCreditAnswerComponent);
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

  it('should run onSubmit method without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.onSubmit();
    expect(component).toBeTruthy();
  }));
});
