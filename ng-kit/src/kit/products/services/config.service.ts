import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { MicroAppInterface, MicroRegistryService } from '../../micro';

@Injectable()
export class ConfigService {

  apiUrl: string = '';
  storeId: number;
  businessSlug: string;

  constructor(
    private microRegistryService: MicroRegistryService,
    private router: Router
  ) {}

  getMicroCode(): string {
    return 'products';
  }

  getProductListUrl(params: {[key: string]: any}): string {
    if (this.storeId) {
      params['storeId'] = this.storeId;
    }

    return this.router.createUrlTree(
      [`/business/${this.businessSlug}/items`],
      { queryParams: params }
    ).toString();
  }

  get microConfig(): MicroAppInterface {
    return this.microRegistryService.getMicroConfig('products') as MicroAppInterface;
  }

}
