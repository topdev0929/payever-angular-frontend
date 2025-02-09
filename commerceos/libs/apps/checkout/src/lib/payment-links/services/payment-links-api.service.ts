import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SelectSnapshot } from "@ngxs-labs/select-snapshot";
import { flatten } from "flat";
import { cloneDeep, forIn } from "lodash";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { FlowInterface } from "@pe/checkout-types";
import { EnvironmentConfigInterface, PE_ENV } from "@pe/common";
import { FilterInterface } from "@pe/grid";
import { BusinessState } from "@pe/user";

import {
  GetPaymentLinkResponse,
  PaymentLinksInterface,
  SearchPaymentLinksInterface,
  GetLinksResponse,
  SearchPaymentLinksResponse,
  FiltersFieldType,
  SearchPaymentLinksItem,
} from "../interfaces";
import { CustomHttpParamEncoder } from "../settings";

@Injectable()
export class PaymentLinksApiService {
  private noCacheHeaders: { [key: string]: string } = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
  };

  private noCacheRequestOptions = {
    headers: this.noCacheHeaders,
  };

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
  ) {
  }

  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  createLink(body): Observable<GetPaymentLinkResponse> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link`;

    return this.httpClient.post<GetPaymentLinkResponse>(path, body);
  }

  deleteLink(id: string) {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link/${id}`;

    return this.httpClient.delete(path);
  }

  getLink(id: string): Observable<GetPaymentLinkResponse> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link/${id}`;

    return this.httpClient.get<GetPaymentLinkResponse>(path);
  }

  clone(id: string): Observable<SearchPaymentLinksItem> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link/${id}/clone`;

    return this.httpClient.post<SearchPaymentLinksItem>(path, {});
  }

  patchLink(id: string, data: Partial<PaymentLinksInterface>): Observable<SearchPaymentLinksItem> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link/${id}`;

    return this.httpClient.patch<SearchPaymentLinksItem>(path, data);
  }

  getLinks(searchData: SearchPaymentLinksInterface): Observable<GetLinksResponse> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link`;

    return this.httpClient.get<GetLinksResponse>(path, { params: this.getSearchParams(searchData) });
  }

  sendToDevice(
    paymentId: string,
    data: {
      email?: string,
      phoneFrom?: string,
      phoneTo?: string,
      subject: string,
      message: string,
    }
  ): Observable<object> {
    const path = `${this.checkoutApi}/business/${this.businessId}/payment-link/${paymentId}/send-to-device`;

    return this.httpClient.post<GetLinksResponse>(path, data);
  }

  getFolderDocuments(searchData: SearchPaymentLinksInterface): Observable<SearchPaymentLinksResponse> {
    const path = `${this.checkoutApi}/folders/business/${this.businessId}/root-documents`;

    return this.httpClient.get<SearchPaymentLinksResponse>(path, { params: this.getSearchParams(searchData) });
  }

  public getValues() {
    return this.httpClient.get<{ filters: FilterInterface[] }>(`${this.checkoutApi}/values`);
  }

  getApiCallFlow(id: string) {
    const path = `${this.checkoutApi}/payment/link/${id}`;

    return this.httpClient.get(path, {
      responseType: 'text',
      observe: 'response',
    }).pipe(
      map(res => res.url?.split('/').slice(-1)?.[0]),
      switchMap(id => this.httpClient.post<FlowInterface>(`${this.checkoutApi}/flow/v1/api-call/${id}`, {}))
    );
  }

  private get checkoutApi() {
    return `${this.envConfig.backend.checkout}/api`;
  }

  private getSearchParams(searchData: SearchPaymentLinksInterface) {
    const searchDataCopy: SearchPaymentLinksInterface = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams({ encoder: new CustomHttpParamEncoder() })
      .set('orderBy', searchData.orderBy ? searchData.orderBy.replace(/p\./g, '') : FiltersFieldType.CreatedAt)
      .set('direction', searchData.direction ? searchData.direction : 'desc')
      .set('limit', searchData.perPage ? `${searchData.perPage}` : '50')
      .set('page', searchData.page ? `${searchData.page}` : '1');

    if (searchDataCopy?.configuration && Object.keys(searchDataCopy.configuration).length) {
      if (searchDataCopy.configuration) {
        for (const filterName in searchDataCopy.configuration) {
          if (
            searchDataCopy.configuration[filterName][0] &&
            ['is', 'isNot'].indexOf(searchDataCopy.configuration[filterName][0].condition) > -1
          ) {
            if (Array.isArray(searchDataCopy.configuration[filterName][0].value)) {
              if (searchDataCopy.configuration[filterName][0].value.length > 1) {
                searchDataCopy.configuration[filterName][0].condition += 'In';
              } else if (searchDataCopy.configuration[filterName][0].value.length === 1) {
                searchDataCopy.configuration[filterName][0].value = searchDataCopy.configuration[filterName][0].value[0];
              }
            }
          }
        }
      }

      const flattenParams: { [propName: string]: string } = flatten(searchDataCopy);
      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (index !== 0) {
              return `[${element}]`;
            }

            return element === 'configuration' ? 'filters' : element;
          })
          .join('');
        if (this.isFilterQuery(httpParamName)) {
          searchParams = searchParams.set(httpParamName, propValue);
        }
      });
    }

    return searchParams;
  }

  private isFilterQuery(query: string): boolean {
    const nonFilterQueries: string[] = [
      'orderBy',
      'direction',
      'limit',
      'page',
    ];

    return nonFilterQueries.indexOf(query) === -1;
  }

}
