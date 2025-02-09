import { isDevMode } from '@angular/core';

import { DevModeService } from './dev-mode.service';

describe('DevModeService', () => {
  let service: DevModeService;

  it('should always return original setting', () => {
    service = new DevModeService();
    expect(service.isDevMode()).toBe(isDevMode());
  });
});
