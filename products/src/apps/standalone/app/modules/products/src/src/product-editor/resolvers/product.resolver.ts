import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { SectionsService } from '../services';
import { Product } from '../../shared/interfaces/product.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { EnvService } from '../../shared/services/env.service';

@Injectable()
export class ProductResolver implements Resolve<Product> {
  constructor(
    private api: ProductsApiService,
    private sectionsService: SectionsService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Product> {
    const productId: string = route.params.productId;
    const needToLoadProduct: boolean = this.sectionsService.resetState$.value;
    if (productId && needToLoadProduct) {
      return this.api.getProduct(productId).pipe(
        tap(product => {
          if (!product.data.product) {
            this.navigateToListAndShowError();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE PRODUCT / ERROR', error);
          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToListAndShowError(): void {
    const url: string[] = ['business', this.envService.businessUuid, 'products', 'list'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' }).then(() => {
      this.snackBarService.toggle(
        true,
        {
          content: this.translateService.translate('snack_bar_exceptions.product_not_exist'),
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        },
      );
    });
  }
}
