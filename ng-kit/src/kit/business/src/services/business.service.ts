import { forkJoin, Observable, of, throwError } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { catchError, map, share } from 'rxjs/operators';


import {
  BusinessChannelInterface,
  BusinessCurrencyInterface,
  BusinessDataInterface,
  BusinessInterface,
  BusinessMenuListDataInterface,
  BusinessPaymentOptionInterface
} from '../interfaces';
import { urls } from '../settings';
import { LANG } from '../../../i18n/src';

interface CashedInterface {
  business: BusinessInterface;
  businessData: BusinessDataInterface;
  businessMenuListData: BusinessMenuListDataInterface;
  channels: BusinessChannelInterface[];
  currencies: BusinessCurrencyInterface[];
  paymentOptions: BusinessPaymentOptionInterface[];
}

interface ObservableInterface {
  business: Observable<BusinessInterface>;
  businessData: Observable<BusinessDataInterface>;
  businessMenuListData: Observable<BusinessMenuListDataInterface>;
  channels: Observable<BusinessChannelInterface[]>;
  currencies: Observable<BusinessCurrencyInterface[]>;
  paymentOptions: Observable<BusinessPaymentOptionInterface[]>;
}

type AttributeType = 'businessData' | 'businessMenuListData' | 'channels' | 'currencies' | 'paymentOptions';

type BusinessResponseType = BusinessDataInterface
  | BusinessMenuListDataInterface
  | BusinessChannelInterface[]
  | BusinessCurrencyInterface[]
  | BusinessPaymentOptionInterface[];

@Injectable()
export class BusinessService {
  private cashed: CashedInterface = {
    business: null,
    businessData: null,
    businessMenuListData: null,
    channels: null,
    currencies: null,
    paymentOptions: null
  };
  private observable: ObservableInterface = {
    business: null,
    businessData: null,
    businessMenuListData: null,
    channels: null,
    currencies: null,
    paymentOptions: null
  };

  constructor(private httpClient: HttpClient,
              @Inject(LANG) private lang: string) {
  }

  get businessData(): BusinessDataInterface {
    return this.cashed.businessData;
  }

  get businessMenuListData(): BusinessMenuListDataInterface {
    return this.cashed.businessMenuListData;
  }

  get channels(): BusinessChannelInterface[] {
    return this.cashed.channels;
  }

  get currencies(): BusinessCurrencyInterface[] {
    return this.cashed.currencies;
  }

  get paymentOptions(): BusinessPaymentOptionInterface[] {
    return this.cashed.paymentOptions;
  }

  clearCache(): void {
    this.cashed.business = null;
    this.cashed.businessData = null;
    this.cashed.businessMenuListData = null;
    this.cashed.channels = null;
    this.cashed.currencies = null;
    this.cashed.paymentOptions = null;
  }

  getBusiness(slug: string, prefix: string, reset: boolean = false): Observable<BusinessInterface> {
    if (!reset && this.cashed.business && this.cashed.business.business.slug === slug) {
      return of(this.cashed.business);
    }
    else if (reset || !this.observable.business) {
      const requests: Observable<BusinessResponseType>[] = [
        this.getBusinessData(slug, prefix, reset),
        this.getBusinessChannels(prefix, reset),
        this.getBusinessCurrencies(slug, prefix, reset),
        this.getBusinessPaymentOptions(prefix, reset)
      ];
      this.observable.business = forkJoin(requests).pipe(
        map((response: BusinessResponseType[]) => {
          this.cashed.business = {
            business: response[0] as BusinessDataInterface,
            channels: {},
            currencies: {},
            paymentOptions: {}
          };
          (response[1] as BusinessChannelInterface[]).forEach((channel: BusinessChannelInterface) => {
            this.cashed.business.channels[channel.type] = channel;
          });
          (response[2] as BusinessCurrencyInterface[]).forEach((currency: BusinessCurrencyInterface) => {
            this.cashed.business.currencies[currency.code] = currency;
          });
          (response[3] as BusinessPaymentOptionInterface[]).forEach((paymentOption: BusinessPaymentOptionInterface) => {
            this.cashed.business.paymentOptions[paymentOption.payment_method] = paymentOption;
          });
          this.observable.business = null;
          return this.cashed.business;
        }), catchError((error: HttpEvent<any>) => {
          this.cashed.business = null;
          this.observable.business = null;
          return throwError(error);
        }), share());
    }
    return this.observable.business;
  }

  getBusinessData(slug: string, prefix: string, reset: boolean = false): Observable<BusinessDataInterface> {
    if (!reset && this.cashed.businessData) {
      return of(this.cashed.businessData);
    }
    else {
      this.request<BusinessDataInterface>('businessData', urls['getBusiness'](slug, prefix), reset);
    }
    return this.observable.businessData;
  }

  getBusinessMenuListData(slug: string, prefix: string, reset: boolean = false): Observable<BusinessMenuListDataInterface> {
    if (!reset && this.cashed.businessMenuListData) {
      return of(this.cashed.businessMenuListData);
    }
    else {
      this.request<BusinessMenuListDataInterface>('businessMenuListData', urls['getBusinessMenuList'](slug, prefix), reset);
    }
    return this.observable.businessMenuListData;
  }

  getBusinessChannels(prefix: string, reset: boolean = false): Observable<BusinessChannelInterface[]> {
    if (!reset && this.cashed.channels) {
      return of(this.cashed.channels);
    }
    else {
      this.request<BusinessChannelInterface[]>('channels', urls['getChannels'](this.lang, prefix), reset);
    }
    return this.observable.channels;
  }

  getBusinessCurrencies(slug: string, prefix: string, reset: boolean = false): Observable<BusinessCurrencyInterface[]> {
    if (!reset && this.cashed.currencies) {
      return of(this.cashed.currencies);
    }
    else {
      this.request<BusinessCurrencyInterface[]>('currencies', urls['getCurrencies'](slug, prefix), reset);
    }
    return this.observable.currencies;
  }

  getBusinessPaymentOptions(prefix: string, reset: boolean = false): Observable<BusinessPaymentOptionInterface[]> {
    if (!reset && this.cashed.paymentOptions) {
      return of(this.cashed.paymentOptions);
    }
    else {
      this.request<BusinessPaymentOptionInterface[]>('paymentOptions', urls['getPaymentOptions'](this.lang, prefix), reset);
    }
    return this.observable.paymentOptions;
  }

  // TODO: think about common class with next 2 methods. Can be usable everywhere in any app-module
  // TODO Replace 'any' to 'T'
  private request<T/* extends BusinessResponseType*/>(attribute: AttributeType, url: string, reset: boolean): void {
    if (reset || !this.observable[attribute]) {
      this.observable[attribute] = this.httpClient.get<any>(url, {withCredentials: true}).pipe(
        map((response: any) => {
          this.cashed[attribute] = response;
          this.observable[attribute] = null;
          return this.cashed[attribute];
        }),
        catchError((error: HttpEvent<any>) => {
          this.cashed[attribute] = null;
          this.observable[attribute] = null;
          return throwError(error);
        }), share()) as any;
    }
  }
}
