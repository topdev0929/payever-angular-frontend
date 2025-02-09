import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppModelInterface } from '../../../../interfaces';
import { ApplicationApiService } from '../../../../modules-new/core/api/application-api.service';
import { ThemeData, ThemeDataContext } from '../../../../modules-new/core/theme.data';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDataGuard implements CanActivate {
  constructor(private applicationApi: ApplicationApiService, private themeData: ThemeData) { }

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
    if (!this.themeData.context) {
      return of(false);
    }

    if (this.themeData.context.channelSet) {
      return of(true);
    }

    let apiCall$: Observable<AppModelInterface>;

    const { businessId, applicationId, applicationType } = this.themeData.context;
    switch (applicationType) {
      case 'pos':
        apiCall$ = this.applicationApi.getTerminal(businessId, applicationId);
        break;
      case 'shop':
        apiCall$ = this.applicationApi.getShop(businessId, applicationId);
        break;
      case 'marketing':
        break;
      default:
        break;
    }

    apiCall$.pipe(
      tap((appModel: AppModelInterface) => {
        const context: ThemeDataContext = { channelSet: appModel.channelSet };
        this.themeData.updateContext(context);
      }),
    ).subscribe();

    return of(true);
  }
}
