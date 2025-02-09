import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ActionModalComponent } from './action-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderService } from '../../../../shared';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { Subject } from 'rxjs';
import { TranslateService } from '@pe/ng-kit/src/kit/i18n';

describe('ActionModalComponent', () => {
  let component: ActionModalComponent;
  let fixture: ComponentFixture<ActionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ActionModalComponent],
      providers: [
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
          provide: Router,
          useValue: {
            navigate: () => {},
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionModalComponent);
    component = fixture.componentInstance;
    component.close$ = new Subject();
    component.heading = '';
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

  it('should call HeaderService setShortHeader on init method without errors', fakeAsync(() => {
    const headerService = TestBed.get(HeaderService);
    const headerServiceSpy = spyOn(headerService, 'setShortHeader');

    component.ngOnInit();
    tick();
    expect(headerServiceSpy).toHaveBeenCalled();
    expect(headerServiceSpy).toHaveBeenCalledTimes(1);
  }));

  it('should call HeaderService destroyShortHeader on destroy method without errors', fakeAsync(() => {
    const headerService = TestBed.get(HeaderService);
    const headerServiceSpy = spyOn(headerService, 'destroyShortHeader');

    component.ngOnInit();
    tick();
    component.ngOnDestroy();

    expect(headerServiceSpy).toHaveBeenCalled();
    expect(headerServiceSpy).toHaveBeenCalledTimes(1);
  }));

  it('should call onClose without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.onClose();
    expect(component).toBeTruthy();
  }));

  it('should destroy without errors', () => {
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });

  it('should be isSingleButton', fakeAsync(() => {
    component.ngOnInit();
    component.buttons = [];
    component.loading = false;
    tick();
    expect(component.isSingleButton).toBeFalsy();
    expect(component.singleButton).toBe(undefined);
  }));
});
