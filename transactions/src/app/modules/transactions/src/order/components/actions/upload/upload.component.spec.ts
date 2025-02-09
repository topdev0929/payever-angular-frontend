import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of, Subject, ReplaySubject } from 'rxjs';

import { ActionUploadComponent } from './upload.component';
import { DetailService } from '../../../services';
import { ApiService, SettingsService } from '../../../../shared';

import { mockOrder } from '../../../../../test-mocks';
import { MediaService, MediaUrlPipe } from '@pe/ng-kit/src/kit/media';
import { EnvironmentConfigService } from '@pe/ng-kit/src/kit/environment-config';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ActionUploadComponent', () => {
  let component: ActionUploadComponent;
  let fixture: ComponentFixture<ActionUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        I18nModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ActionUploadComponent],
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
        FormBuilder,
        {
          provide: DetailService,
          useValue: {
            getData: () => of(mockOrder),
            actionOrder: () => of({}),
            actionOrderUpload: () => of({}),
          },
        },
        {
          provide: MediaService,
          useValue: {
            createBlobByBusiness: () => of({}),
          },
        },
        {
          provide: MediaUrlPipe,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: EnvironmentConfigService,
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
    fixture = TestBed.createComponent(ActionUploadComponent);
    component = fixture.componentInstance;
    component['order'] = mockOrder as any;
    component.close$ = new Subject();
    component['destroyed$'] = new ReplaySubject(0);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors ', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should addFormRow without errors ', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.addFormRow();
    expect(component).toBeTruthy();
  }));

  it('should fileErrors without errors ', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.fileErrors();
    expect(component).toBeTruthy();
  }));

  it('should onChangeFile without errors ', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['fileInput'] = new ElementRef(document.createComment('input'));
    component.onChangeFile({
      target: { files: [new File([], 'test')] },
    } as any);
    expect(component).toBeTruthy();
  }));

  it('should submit without errors ', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['fileInput'] = new ElementRef(document.createComment('input'));
    component.onChangeFile({
      target: { files: [new File([], 'test')] },
    } as any);

    tick(1000);
    component.onSubmit();

    // setting a form to valid
    Object.defineProperty(component.form, 'valid', {
      value: true,
      writable: true,
    });
    component.onSubmit();
    expect(component).toBeTruthy();
  }));

  it('should remove file', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component['fileInput'] = new ElementRef(document.createComment('input'));
    component.onChangeFile({
      target: { files: [new File([], 'test')] },
    } as any);
    component.removeFile(1);
    expect(component).toBeTruthy();
  }));

  it('should destroy without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));
});
