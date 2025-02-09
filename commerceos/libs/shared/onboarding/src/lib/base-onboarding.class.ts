import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PeAuthService } from '@pe/auth';

import { ActionDTO } from './models';

export class BaseOnboardingService {
  protected http = this.injector.get(HttpClient);
  protected authService = this.injector.get(PeAuthService);

  constructor(
    protected injector: Injector,
  ) {}

  public afterActionApi(requestData: ActionDTO): Observable<any> {
    const url: string = requestData.url;
    const data = requestData.method === 'POST' || requestData.method === 'PATCH' ? requestData.payload ?? {} : {};
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify(data);

    return this.http.request(
      requestData.method,
      url,
      {
        body,
        headers,
      },
    ).pipe(
      catchError(() => of(null)),
      exhaustMap((res: any) => requestData.name === 'refresh-token'
        ? this.authService.setToken(res.accessToken)
        : of(res)
      ),
    );
  }

  protected sortActionsByOrderId(actions: ActionDTO[]): ActionDTO[] {
    return actions.sort((a, b) => {
      return a.orderId - b.orderId;
    });
  }
}
