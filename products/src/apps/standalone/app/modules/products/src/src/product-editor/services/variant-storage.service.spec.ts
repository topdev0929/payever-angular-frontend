import { TestBed } from '@angular/core/testing';

import { VariantStorageService } from './variant-storage.service';

describe('VariantStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VariantStorageService = TestBed.get(VariantStorageService);
    expect(service).toBeTruthy();
  });
});
