import { isDevMode, Injectable } from '@angular/core';

import { DevModeStubService } from './dev-mode.service.stub';
import { DevModeService } from './dev-mode.service';
import { TestBed } from '@angular/core/testing';

describe('DevModeStubService', () => {
  let service: DevModeStubService;

  beforeEach(() => {
    service = new DevModeStubService();
  });

  it('should return original value by default', () => {
    expect(service.isDevMode()).toBe(isDevMode());
  });

  it('should be able to switch mode', () => {
    service.enableDevMode();
    expect(service.isDevMode()).toBe(true);

    service.enableProdMode();
    expect(service.isDevMode()).toBe(false);

    service.enableDevMode();
    expect(service.isDevMode()).toBe(true);
  });

  it('should reset() devMode', () => {
    const initialValue: boolean = service.isDevMode();
    service.enableProdMode();
    expect(service.isDevMode()).not.toBe(initialValue);
    service.reset();
    expect(service.isDevMode()).toBe(initialValue);
  });

  it('should get provider', () => {
    @Injectable()
    class TestService {
      constructor(
        public devMode: DevModeService
      ) {}
    }

    TestBed.configureTestingModule({
      providers: [
        TestService,
        DevModeStubService.provide()
      ]
    });

    const service: TestService = TestBed.get(TestService);
    expect(service).toBeTruthy('self-test');
    expect(service.devMode instanceof DevModeStubService).toBe(true);
    expect(service.devMode instanceof DevModeService).toBe(false);
  });
});
