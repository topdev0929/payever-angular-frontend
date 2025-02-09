import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PlatformHeaderGuard } from './platform-header.guard';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { PlatformService } from '@pe/ng-kit/src/kit/common';
import {
  MicroLoaderService,
  MicroRegistryService,
} from '@pe/ng-kit/src/kit/micro';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('PlatformHeaderGuard', () => {
  let guard: PlatformHeaderGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlatformHeaderGuard,
        {
          provide: PlatformHeaderService,
          useValue: {},
        },
        {
          provide: PlatformService,
          useValue: {},
        },
        {
          provide: MicroLoaderService,
          useValue: {},
        },
        {
          provide: MicroRegistryService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  beforeEach(() => {
    guard = TestBed.get(PlatformHeaderGuard);
  });

  it('should create', () => {
    expect(guard).toBeTruthy();
  });

  it('should getAppRootTagName without errors', () => {
    expect(guard['getAppRootTagName']({} as ActivatedRouteSnapshot)).toBe(
      'transactions-app'
    );
  });

  it('should getBusinessId without errors', () => {
    expect(guard['getBusinessId']({ params: { uuid: 'test' } } as any)).toBe(
      'test'
    );
  });

  it('should getHeaderAppInputData without errors', () => {
    expect(
      guard['getHeaderAppInputData']({
        queryParams: { shop: true },
        params: { uuid: 'test' },
      } as any)
    ).toBeTruthy();
    expect(
      guard['getHeaderAppInputData']({
        queryParams: { pos: true },
        params: { uuid: 'test' },
      } as any)
    ).toBeTruthy();
  });
});
