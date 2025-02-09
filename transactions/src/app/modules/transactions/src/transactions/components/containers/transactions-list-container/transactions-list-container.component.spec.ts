import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TransactionsListContainerComponent } from './transactions-list-container.component';
import { HeaderService, SettingsService } from '../../../../shared';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { WindowService } from '@pe/ng-kit/src/kit/window';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { of, Subject } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { Store } from '@ngrx/store';
import { PlatformService } from '@pe/ng-kit/src/kit/common';

describe('TransactionsListContainerComponent', () => {
  let component: TransactionsListContainerComponent;
  let fixture: ComponentFixture<TransactionsListContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), I18nModule.forRoot()],
      declarations: [TransactionsListContainerComponent],
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
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getFiltersCacheKey: () => 'browser-key',
          },
        },
        {
          provide: PlatformService,
          useValue: {
            microAppReady$: of(false),
            backToDashboard$: of(true),
          },
        },
        {
          provide: Store,
          useValue: {
            select: () => of(true),
          },
        },
        {
          provide: LocalStorageService,
          useValue: {
            clear: () => {},
            store: () => {},
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
            isIpad$: of(false),
            isTablet$: of(false),
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
    fixture = TestBed.createComponent(TransactionsListContainerComponent);
    component = fixture.componentInstance;
    component['destroyed$'] = new Subject();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute onInit without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should execute ngAfterViewInit without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngAfterViewInit();
    expect(component).toBeTruthy();
  }));

  it('should execute onDestroy without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));

  it('should execute onDestroy without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  }));
});
