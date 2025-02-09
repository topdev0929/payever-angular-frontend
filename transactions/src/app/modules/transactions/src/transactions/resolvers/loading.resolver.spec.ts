import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { LoadingResolver } from './loading.resolver';
import { PlatformService } from '@pe/ng-kit/src/kit/common';

describe('Loading Resolver', () => {
  let resolver: LoadingResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingResolver,
        {
          provide: PlatformService,
          useValue: {
            dispatchEvent: (value: any) => value,
          },
        },
      ],
    });
  });

  beforeEach(() => {
    resolver = TestBed.get(LoadingResolver);
  });

  it('should create', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call PlatformService dispatchEvent on resolve', () => {
    const platformService = TestBed.get(PlatformService);
    const platformServiceSpy = spyOn(platformService, 'dispatchEvent');

    resolver.resolve();

    expect(platformServiceSpy).toHaveBeenCalledTimes(1);
    expect(platformServiceSpy).toHaveBeenCalledWith({
      target: 'dashboard-micro-loading',
      action: 'NoLoading',
    });
  });
});
