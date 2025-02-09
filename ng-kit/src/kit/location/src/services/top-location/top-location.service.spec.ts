import { TestBed } from '@angular/core/testing';

import { TopLocationService } from './top-location.service';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { LocationTestingModule } from '../../../testing/location-testing.module';

describe('TopLocationService', () => {
  let service: TopLocationService;

  nonRecompilableTestModuleHelper({
    imports: [
      LocationTestingModule
    ]
  });

  beforeEach(() => service = TestBed.get(TopLocationService));

  it('Has correct href', () => {
    expect(service.href).toBeTruthy('Should not be empty');
    expect(service.href).not.toEqual('http://test.test/', 'Should not have test value');
    service.href = 'http://test.test/';
    expect(service.href).toEqual('http://test.test/', 'Should be saved');
  });
});
