import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of, Subject, ReplaySubject } from 'rxjs';

import { ActionVoidComponent } from './void.component';
import { DetailService } from '../../../services';
import { ApiService } from '../../../../shared';

import { mockOrder } from '../../../../../test-mocks';

describe('ActionVoidComponent', () => {
  let component: ActionVoidComponent;
  let fixture: ComponentFixture<ActionVoidComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot()],
      declarations: [ActionVoidComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
              params: {
                uuid: 'rty876-876456hh-67jmju-iyuiok',
                orderId: 'rty876-876456hh-67jmju-iyuiok',
              },
              data: {
                action: 'update',
              },
            },
            params: of({
              orderId: 'rty876-876456hh-67jmju-iyuiok',
            }),
          },
        },
        {
          provide: DetailService,
          useValue: {
            getData: () => of(mockOrder),
            actionOrder: () => of({}),
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
    fixture = TestBed.createComponent(ActionVoidComponent);
    component = fixture.componentInstance;
    component['order'] = mockOrder as any;
    component.close$ = new Subject();
    component['destroyed$'] = new ReplaySubject(0);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should submit form without error', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.onSubmit();
    expect(component).toBeTruthy();
  }));

  it('should ngOnDestroy without error', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));
});
