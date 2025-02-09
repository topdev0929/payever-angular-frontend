import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DeviceUUID } from 'device-uuid';

@Injectable({
  providedIn: 'root',
})
export class DeviceUuidGuard {

  private readonly router = inject(Router);

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot) {
    const queryParams = activatedRouteSnapshot.queryParams;
    const deviceUUID = new DeviceUUID();

    if (queryParams.deviceUUID && deviceUUID.get() !== queryParams.deviceUUID) {
      const staticPage = queryParams.staticPage ?? 'fail';

      this.router.navigate(['/pay', 'static-finish', staticPage]);

      return false;
    }

    return true;
  }
}
