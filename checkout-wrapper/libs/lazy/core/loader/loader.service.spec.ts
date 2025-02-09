import { TestBed } from '@angular/core/testing';

import { LoaderService } from './loader.service';

describe('App Services: LoaderService', () => {
  let service: LoaderService = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoaderService,
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(LoaderService);
  });

  it('should set loader to True', (done: jest.DoneCallback) => {
    service.loader$.subscribe((isLoading: boolean) => {
      expect(isLoading)
        .toBe(true);
      done();
    });
    service.loader = true;
  });

  it('should set loader to False', (done: jest.DoneCallback) => {
    service.loader$.subscribe((isLoading: boolean) => {
      expect(isLoading)
        .toBe(false);
      done();
    });
    service.loader = false;
  });

  it('should set loaderGlobal to True', (done: jest.DoneCallback) => {
    service.loaderGlobal$.subscribe((isLoading: boolean) => {
      expect(isLoading)
        .toBe(true);
      done();
    });
    service.loaderGlobal = true;
  });

  it('should set loaderGlobal to False', (done: jest.DoneCallback) => {
    service.loaderGlobal$.subscribe((isLoading: boolean) => {
      expect(isLoading)
        .toBe(false);
      done();
    });
    service.loaderGlobal = false;
  });
});
