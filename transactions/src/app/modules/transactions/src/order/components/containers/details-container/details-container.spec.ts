import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DetailsContainerComponent } from './details-container.component';
import { PlatformService } from '@pe/ng-kit/src/kit/common';
import { DetailService } from '../../../services';
import { HeaderService } from '../../../../shared';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { WindowService } from '@pe/ng-kit/src/kit/window';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of } from 'rxjs';

describe('DetailsContainerComponent', () => {
  let component: DetailsContainerComponent;
  let fixture: ComponentFixture<DetailsContainerComponent>;

  let headerService: HeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot()],
      declarations: [DetailsContainerComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: DetailService,
          useValue: {
            loading$: of(false),
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
    fixture = TestBed.createComponent(DetailsContainerComponent);
    component = fixture.componentInstance;
    headerService = TestBed.get(HeaderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should call HeaderService setShortHeader on init without errors', fakeAsync(() => {
    const headerServiceSpy = spyOn(headerService, 'setShortHeader');

    component.ngOnInit();
    tick();
    expect(headerServiceSpy).toHaveBeenCalledTimes(1);
  }));

  it('should run ngAfterViewInit without errors', fakeAsync(() => {
    component.ngAfterViewInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should run ngAfterViewChecked without errors', fakeAsync(() => {
    component.ngAfterViewChecked();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should call HeaderService destroyShortHeader on destroy without errors', fakeAsync(() => {
    const headerServiceSpy = spyOn(headerService, 'destroyShortHeader');
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(headerServiceSpy).toHaveBeenCalledTimes(1);
  }));

  it('should call backToTransactionsList without errors', fakeAsync(() => {
    const routerSpy = spyOn(TestBed.get(Router), 'navigate');
    component.ngOnInit();
    tick();
    component.backToTransactionsList();
    expect(routerSpy).toHaveBeenCalledTimes(1);
  }));
});
