import { ActivatedRouteSnapshot } from '@angular/router';

import { PlatformService } from '@pe/common';

import { LoadingGuard } from './loading.guard';

describe('LoadingGuard', () => {
  let guard: LoadingGuard;

  let platformServiceMock: PlatformService;
  let activatedRouteSnapshotMock: ActivatedRouteSnapshot;

  beforeEach(() => {
    platformServiceMock = {} as PlatformService;
    activatedRouteSnapshotMock = {} as ActivatedRouteSnapshot;

    guard = new LoadingGuard(platformServiceMock);
  });

  it('should toggle loading state', () => {
    guard.canActivate(activatedRouteSnapshotMock);

    expect(platformServiceMock.microLoaded).toBe(true);
    expect(platformServiceMock.microAppReady).toBe('products');
  });
});
