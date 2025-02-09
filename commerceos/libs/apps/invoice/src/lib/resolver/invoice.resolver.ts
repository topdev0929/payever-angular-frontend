import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeInvoiceApi } from '../services/invoice.api';


@Injectable()
export class InvoiceResolver implements Resolve<any> {
  constructor(
    private api: PeInvoiceApi,
    private router: Router,
    private envService: EnvService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const invoiceId: string = route.params.invoiceId;
    if (invoiceId) {
      return this.api.getInvoiceById(invoiceId).pipe(
        tap((invoice) => {
          if (!invoice) {
            this.navigateToList();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE INVOICE / ERROR', error);
          this.navigateToList();

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'invoice'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}
