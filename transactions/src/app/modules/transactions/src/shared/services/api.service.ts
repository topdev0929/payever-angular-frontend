import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { flatten } from 'flat';
import { cloneDeep, forIn } from 'lodash-es';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { DataGridTableColumnInterface } from '@pe/ng-kit/modules/data-grid';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { ExportFormats } from '../../transactions/common/entries';

import {
  ColumnsInterface,
  FiltersFieldType,
  ListColumnsInterface,
  ListResponseInterface,
  SearchTransactionsInterface,
  UserBusinessInterface,
  CurrencyInterface,
  DetailInterface,
  ActionInterface,
  MailActionInterface,
  ShippingLabelInterface,
  ShippingSlipInterface,
  ProcessShippingOrderInterface,
  PaymentInterface,
  BusinessVatInterface, ActionType
} from '../interfaces';
import { SettingsService } from './settings.service';

@Injectable()
export class ApiService {

  constructor(
    private configService: EnvironmentConfigService,
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  // TODO: interface for order details
  getTransactionDetails(orderUuid: string): Observable<DetailInterface> {
    const path: string = this.settingsService.getApiGetOrderDetailsUrl(orderUuid);
    return this.http.get<DetailInterface>(path);
  }

  getShippingActions(order: DetailInterface): Observable<ActionInterface[]> {
    const path: string = this.settingsService.externalUrls.getShippingActionsUrl();
    return this.http.post<ActionInterface[]>(this.settingsService.externalUrls.getShippingActionsUrl(), order).pipe(
      catchError(() => of([]))
    );
  }

  getMailerActions(order: DetailInterface): Observable<MailActionInterface[]> {
    const path: string = this.settingsService.externalUrls.getShippingActionsUrl();
    return this.http.post<MailActionInterface[]>(this.settingsService.externalUrls.getMailerActionsUrl(), order).pipe(
      catchError(() => of([]))
    );
  }

  getTransactions(searchData: SearchTransactionsInterface): Observable<ListResponseInterface> {
    const path: string = this.settingsService.apiGetListUrl;
    return this.http.get<ListResponseInterface>(path, { params: this.getSearchParams(searchData) });
  }

  exportTransactions(
    format: ExportFormats,
    columns: DataGridTableColumnInterface[],
    businessName: string,
    searchData: SearchTransactionsInterface): Observable<HttpResponse<any>> {
    let params: HttpParams = this.getSearchParams(searchData);
    params = params.set('format', format)
      .set('businessName', businessName)
      .set('columns', JSON.stringify(columns));
    params.keys().forEach(key => {
      const paramStr: string = params.get(key);
      if (params.get(key).length === 0) {
        params = params.delete(key);
      }
    });
    const path: string = this.settingsService.apiGetExport;
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/octet-stream'
    });
    return this.http.get(path, {params, headers, responseType: 'blob', observe: 'response'});
  }

  getTransactionsListColumns(): Observable<string[]> {
    const path: string = this.settingsService.apiGetColumnsUrl;
    return this.http.get<ListColumnsInterface>(path).pipe(
      map((columnsResponse: ListColumnsInterface) => columnsResponse.columns_to_show));
  }

  getBusinessData(): Observable<UserBusinessInterface> {
    const path: string = this.settingsService.getBusinessDataUrl();
    return this.http.get<UserBusinessInterface>(path);
  }

  getCurrencies(): Observable<CurrencyInterface[]> {
    const path: string = `${this.settingsService.apiMicroConnectUrl}/api/currency`;
    return this.http.get<CurrencyInterface[]>(path);
  }

  apiGetOrderPayment(orderId: string): Observable<PaymentInterface> {
    return this.http.get<PaymentInterface>(this.settingsService.apiBusinessUrls['apiGetOrderPaymentUrl'](orderId), { withCredentials: true });
  }

  getBusinessVat(businessUuid: string): Observable<BusinessVatInterface[]> {
    return this.http.get<BusinessVatInterface[]>(this.settingsService.externalUrls['getBusinessVatUrl'](businessUuid), { withCredentials: true });
  }

  postAction(businessUuid: string, orderId: string, action: ActionType, payload: any): Observable<any> {
    const url: string = this.settingsService.apiBusinessUrls['postActionUrl'](this.settingsService.businessUuid, orderId, action);
    return this.http.post(url, payload);
  }

  putTransactionsListColumns(columns: string[]): Observable<ColumnsInterface> {
    const data: ColumnsInterface = {
      columnsToShow: columns
    };
    return this.http.put<ColumnsInterface>(this.settingsService.apiPutColumnsUrl, data, { withCredentials: true });
  }

  checkSantanderStatus(orderId: string): Observable<boolean> {
    return this.http.get(this.settingsService.externalUrls['getSantanderCheckStatusUrl'](this.settingsService.businessUuid, orderId)).pipe(
      map(() => true),
      catchError((error: any) => throwError(error))
    );
  }

  downloadLabel(businessId: string, orderId: string): Observable<ShippingLabelInterface> {
    const shippingBackendUrl: string = this.configService.getBackendConfig().shipping;
    const endpointUrl: string = `${shippingBackendUrl}/api/business/${businessId}/shipping-orders/${orderId}/label`;
    return this.http.post<ShippingLabelInterface>(endpointUrl, { labelResponseType: 'URL' });
  }

  getShippingSlip(businessId: string, orderId: string): Observable<ShippingSlipInterface> {
    const shippingBackendUrl: string = this.configService.getBackendConfig().shipping;
    const endpointUrl: string = `${shippingBackendUrl}/api/business/${businessId}/shipping-orders/${orderId}/slip`;
    return this.http.get<ShippingSlipInterface>(endpointUrl);
  }

  processShippingOrder(order: ProcessShippingOrderInterface, shippingOrderId: string): Observable<void> {
    const endpointUrl: string = this.settingsService.apiBusinessUrls.postShippingOrder(this.settingsService.businessUuid, shippingOrderId);
    return this.http.post<void>(endpointUrl, order);
  }

  resendShippingConfirmation(businessUuid: string, mailEventId: string): Observable<void> {
    const mailerBackendUrl: string = this.configService.getConfig().backend.mailer;
    const endpointUrl: string = `${mailerBackendUrl}/api/business/${this.settingsService.businessUuid}/payment-mail/${mailEventId}`;
    return this.http.post<void>(endpointUrl, {});
  }

  private getSearchParams(searchData: SearchTransactionsInterface): HttpParams {
    const searchDataCopy: SearchTransactionsInterface = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('orderBy', searchDataCopy.orderBy ? searchDataCopy.orderBy.replace(/p\./g, '') : FiltersFieldType.CreatedAt)
      .set('direction', searchDataCopy.direction ? searchDataCopy.direction : 'desc')
      .set('limit', '20')
      .set('query', searchDataCopy.search ? searchDataCopy.search : '')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
    if (searchData.currency) {
      searchParams = searchParams.set('currency', searchData.currency);
    }

    if (searchDataCopy && searchDataCopy.configuration && Object.keys(searchDataCopy.configuration).length) {
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
          // TODO This is temporary fix
          if (httpParamName.indexOf('filters[channel]') === 0 && propValue === 'WooCommerce') {
            propValue = 'woo_commerce';
          }
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
      'page'
    ];
    return nonFilterQueries.indexOf(query) === -1;
  }

}
