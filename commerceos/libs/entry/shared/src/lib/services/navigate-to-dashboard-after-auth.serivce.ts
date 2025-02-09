import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessApiService, BusinessListInterface } from '@pe/business';


@Injectable()
export class NavigateToDashboardAfterAuthService {
  constructor(
    private authService: PeAuthService,
    private apiService: BusinessApiService,
    private router: Router,
  ) {}

  enterToDashboard(businessData: BusinessListInterface) {
    const businessesId = businessData.businesses[0]._id;
    if (businessData.total === 1) {
      this.router.navigate([`business/${businessesId}/info/overview`]);
    } else {
      this.router.navigate(['switcher']);
    }
  }

  redirectAfterAuth(): Observable<BusinessListInterface> {
    return this.apiService.getBusinessesList().pipe(
      tap((businessData) => {
        if (businessData.businesses.length) {
          this.enterToDashboard(businessData);
        } else {
          this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
        }
      }),
    );
  }
}
