import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { EnvService, TreeFilterNode } from '@pe/common';

import { PE_COUPONS_API_PATH } from './actual.coupons.api';


@Injectable({ providedIn: 'any' })
export class PebCouponPackagesService {
  constructor(
    private http: HttpClient,
    @Inject(PE_COUPONS_API_PATH) private couponsApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private baseUrl = `${this.couponsApiPath}/business/${this.businessId}/folders/item`;

  getTreeData() {
    return this.http.get(this.baseUrl).pipe(
      map(() => {
        const treeData: TreeFilterNode[] = [];
        treeData.push({
          name: 'coupon-app.packages_nav.boxes',
          image: 'assets/shipping.svg',
          editing: true,
          children: [
            {
              name: '',
              image: 'assets/shipping.svg',
              editing: true,
            },
          ],
        });
        return treeData;
      }),
    );
  }

  deletePackage(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
