import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MicroAppInterface, MicroLoaderService, MicroRegistryService } from '@pe/common';

import { PlatformHeaderGuard } from './platform-header.guard';

describe('PlatformHeaderGuard', () => {
  let platformHeaderGuard: PlatformHeaderGuard;
  let injector: Injector;

  let microLoaderServiceSpy: jasmine.SpyObj<MicroLoaderService>;
  let microRegistryServiceSpy: jasmine.SpyObj<MicroRegistryService>;

  beforeEach(() => {
    microLoaderServiceSpy = jasmine.createSpyObj<MicroLoaderService>('MicroLoaderService', ['unloadScript']);
    microRegistryServiceSpy = jasmine.createSpyObj<MicroRegistryService>('MicroRegistryService', ['getMicroConfig', 'getRegisteredMicros']);

    microRegistryServiceSpy.getMicroConfig.and.returnValue({} as MicroAppInterface);
    microRegistryServiceSpy.getRegisteredMicros.and.returnValue(of([] as MicroAppInterface[]));

    injector = {
      get<T>(token: any): T {
        return null as T;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        PlatformHeaderGuard,
        { provide: Injector, useFactory: () => injector },
        { provide: MicroLoaderService, useValue: microLoaderServiceSpy },
        { provide: MicroRegistryService, useValue: microRegistryServiceSpy },
      ],
    });

    platformHeaderGuard = TestBed.get(PlatformHeaderGuard);
  });

  it('should be defined', () => {
    expect(platformHeaderGuard).toBeDefined();
  });

  it('#canActivate should return true for `marketing` app', () => {});

  it('#canActivate should return true when app is not set', () => {});

  it('#canActivate should return true for other cases', () => {});
});
