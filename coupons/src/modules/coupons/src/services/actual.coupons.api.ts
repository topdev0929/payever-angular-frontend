import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, EnvService } from '@pe/common';
import { PeAuthService } from '@pe/auth';

import { PeCoupon } from '../misc/interfaces/coupon.interface';
import { PeFolder } from '../misc/interfaces/folder.interface';
import { PeCouponsApi } from './abstract.coupons.api';

export const PE_COUPONS_API_PATH = new InjectionToken<string>('PE_COUPONS_API_PATH');

@Injectable()
export class ActualPeCouponsApi extends PeCouponsApi {

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    @Inject(PE_COUPONS_API_PATH) private couponsApiPath: string,
    private authTokenService: PeAuthService,
    private http: HttpClient,
    private envService: EnvService,
  ) {
    super();
  }

  getCouponsList(filter? :any): Observable<any> {
    let params;
    if (filter) {
      params = `filter=${JSON.stringify(filter)}`;
    }
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons?${params}`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  postCoupons(couponData: PeCoupon): Observable<any> {
    return this.http.post(`${this.couponsApiPath}/business/${this.envService.businessId}/folders`, couponData, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getCouponById(couponId: string): Observable<any> {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getCouponExtraField(couponId: string): Observable<any> {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}/type-extra-fields`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getCouponEligibilityById(couponId: string): Observable<any> {
    return this.http.get(
      `${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}/eligibility`, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  getCouponByCode(couponCode: string): Observable<any> {
    return this.http.get(
      `${this.couponsApiPath}/business/${this.envService.businessId}/coupons/by-code/${couponCode}`, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  createCoupon(coupon: PeCoupon): Observable<any> {
    return this.http.post(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons`, coupon, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  postCoupon(couponId: string, coupon: PeCoupon): Observable<any> {
    return this.http.post(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}`, coupon, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  updateCoupon(couponId: string, coupon: PeCoupon): Observable<any> {
    return this.http.put(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}`, coupon, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  deleteCoupon(couponId: string): Observable<null> {
    return this.http.delete<null>(`${this.couponsApiPath}/business/${this.envService.businessId}/coupons/${couponId}`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getFolders(): Observable<any> {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/folders`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getCouponsFolders(): Observable<any> {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/folders/tree`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getCouponsFolderById(folderId: string): Observable<PeFolder> {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/folders/${folderId}`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  postCouponsFolder(folderData: PeFolder): Observable<any> {
    return this.http.post(`${this.couponsApiPath}/business/${this.envService.businessId}/folders`, folderData, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  updateCouponsFolder(folderId:string, folderData: PeFolder): Observable<any> {
    return this.http.patch(
      `${this.couponsApiPath}/business/${this.envService.businessId}/folders/${folderId}`, folderData, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  deleteCouponsFolder(folderId: string): Observable<any> {
    return this.http.delete(`${this.couponsApiPath}/business/${this.envService.businessId}/folders/${folderId}`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  updateCouponFolder({ couponId, parentFolder }: {couponId: string, parentFolder: string}): Observable<any> {
    return this.http.patch(
      `${this.couponsApiPath}/business/${this.envService.businessId}/folders/item/${couponId}`,
      { parentFolder }, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  getProducts() {
    return this.http.post(`${this.envConfig.backend.products}/products`, {
      query: `{
        getProducts(
          businessUuid: "${this.envService.businessId}",
          paginationLimit: 100,
          orderBy: "price",
          orderDirection: "desc",
        ) {
          products {
            _id
            businessUuid
            images
            imagesUrl
            title
            price
            variants {
              _id
              businessUuid
              images
              imagesUrl
              title
              price
              sku
              onSales
              salePrice
            }
            sku
            onSales
            salePrice
          }
        }
      }`,
    });
  }

  getCategories() {
    return this.http.post(`${this.envConfig.backend.products}/products`, {
      query: `{
        getCategories (
          businessUuid: "${this.envService.businessId}",
        ) {
          _id
          slug
          title
          businessUuid
        }
      }`,
    });
  }

  getChannels() {
    return this.http.get(`${this.couponsApiPath}/business/${this.envService.businessId}/channel-set/type/`);
  }

  getContactGroups() {
    return this.http.post(`${this.envConfig.backend.contacts}/graphql`, {
      query: `{
        groups(
          first: 100,
          offset: 0,
          filter: { and: [
            {businessId: {equalTo: "${this.envService.businessId}"}, }
          ]},
        ) {
          nodes {
            id
            businessId
            name
            isDefault
          }
          totalCount
          pageInfo {
            hasNextPage
          }
        }
      }`,
    });
  }

  getContacts() {
    return this.http.post(`${this.envConfig.backend.contacts}/graphql`, {
      query: `{
        contacts(
          orderBy: CREATED_AT_DESC,
          first: 100,
          offset: 0,
          filter: { and: [
            {businessId: {equalTo: "${this.envService.businessId}"}, }
          ]},
        ) {
          nodes {
            id
            type
            businessId
            contactFields {
              nodes {
                fieldId
                id
                value
                contactId
                field {
                  id
                  businessId
                  name
                  type
                  groupId
                }
              }
            }
          }
          totalCount
          pageInfo {
            hasNextPage
          }
        }
      }`,
    });
  }
}
