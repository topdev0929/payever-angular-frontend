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

import { ActionVerifyComponent } from './verify.component';

import { DetailService } from '../../../services';
import { ApiService } from '../../../../shared';

import { mockOrder } from '../../../../../test-mocks';
import { AddressService } from '@pe/ng-kit/src/kit/address';
import { FormBuilder, FormControl } from '@angular/forms';
import { FORM_DATE_ADAPTER } from '@pe/ng-kit/src/kit/form-core/constants';

describe('ActionVerifyComponent', () => {
  let component: ActionVerifyComponent;
  let fixture: ComponentFixture<ActionVerifyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot()],
      declarations: [ActionVerifyComponent],
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
          provide: AddressService,
          useValue: {
            getNameString: () => 'test',
            getAddressString: () => 'test Address',
          },
        },
        {
          provide: FormBuilder,
          useValue: {
            group: () => ({
              valueChanges: of({}),
              controls: {
                confirm: new FormControl(),
                signed: new FormControl(),
              },
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
        {
          provide: FORM_DATE_ADAPTER,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionVerifyComponent);
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

  it('should verifyApprove without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.verifyApprove();
    expect(component).toBeTruthy();
  }));

  it('should verifyDecline without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.verifyDecline();
    expect(component).toBeTruthy();
  }));

  it('should destroy without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));
});
