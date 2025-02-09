import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, EnvService, PE_ENV } from '@pe/common';

import { PEB_POS_API_PATH, PE_PRODUCTS_API_PATH } from '../constants';
import { PePosProductInterface } from '../misc/interfaces/product.interface';

import { PosEnvService } from './pos-env.service';
import {
  IntegrationConnectInfoInterface, IntegrationInfoInterface, PePosServerProductResponse, PebPosAccessConfig, Pos, PosAccessConfig, PosCreate,
} from './pos.types';

export interface UploadResponseInterface {
  blobName: string;
  brightnessGradation: string;
  preview: string;
}

@Injectable({ providedIn: 'any' })
export class PosApi {

  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvInterface,
    @Inject(EnvService) private envService: PosEnvService,
    @Inject(PEB_POS_API_PATH) private posApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
  ) {
  }

  private get businessId() {
    return this.envService.businessId;
  }

  private get posId() {
    return this.envService.posId;
  }

  getList(): Observable<Pos[]> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.get<Pos[]>(endpoint);
  }

  getPos(posId: string): Observable<Pos> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.get<Pos>(endpoint);
  }

  create(payload: PosCreate): Observable<PosCreate> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.post<PosCreate>(endpoint, payload);
  }

  validateName(name: string): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.envService.businessId}/terminal/isValidName?name=${name}`;

    return this.http.get(endpoint);
  }

  delete(posId: string): Observable<null> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.delete<null>(endpoint);
  }

  update(posId: string, payload: PosCreate): Observable<PosCreate> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.patch<PosCreate>(endpoint, payload);
  }

  markAsDefault(posId: string): Observable<Pos> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}/active`;

    return this.http.patch<Pos>(endpoint, {});
  }

  updateDeploy(posId: string, payload: PosAccessConfig): Observable<PosAccessConfig> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/access/${posId}`;

    return this.http.patch<PosAccessConfig>(endpoint, payload);
  }

  updateAccessConfig(posId: string, payload: Partial<PebPosAccessConfig>): Observable<PebPosAccessConfig> {
    return this.http.patch<PebPosAccessConfig>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}`,
      payload,
    );
  }

  checkIsLive(posId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}/is-live`,
    );
  }

  patchIsLive(posId: string, isLive: boolean): Observable<null> {
    return this.http.patch<null>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}`,
      { isLive },
    );
  }

  addSocialImage(accessId: string, image: string) {
    return this.http.patch(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${accessId}`,
      { socialImage: image },
    );
  }

  instantSetup() {
    return this.http.put(`${this.posApiPath}/business/${this.businessId}/terminal/${this.posId}/instant-setup`, {});
  }

  getIntegrationsInfo(businessId: string):  Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(`${this.posApiPath}/business/${businessId}/integration`);
  }

  getIntegrationInfo(businessId: string, integration: string): Observable<IntegrationInfoInterface> {
    return this.http.get<IntegrationInfoInterface>(
      `${this.posApiPath}/business/${businessId}/integration/${integration}`);
  }

  getConnectIntegrationInfo(integrationId: string): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>(
      `${this.env.backend.connect}/api/integration/${integrationId}`);
  }

  getTerminalEnabledIntegrations(businessId: string, terminalId: string) {
    return this.http.get(`${this.posApiPath}/business/${businessId}/terminal/${terminalId}/integration`);
  }

  toggleTerminalIntegration(businessId: string, terminalId: string, integrationName: string, enable: boolean) {
    return this.http.patch<any>(
      `${this.posApiPath}/business/${businessId}/terminal/${terminalId}`
      + `/integration/${integrationName}/${enable ? 'install' : 'uninstall'}`, {});
  }

  private productsGQL(filterByTitle: string = ''): { query: string } {
    return {
      query: `{
        getProducts(
          businessUuid: "${this.businessId}",
          filters: {
            fieldType: "string"
            field: ""
            value: ""
          },
          paginationLimit: 100,
          orderBy: "",
          orderDirection: "asc",
        ) {
          products {
            imagesUrl
            title
            description
            priceAndCurrency
            id
            price
            currency
            variants { id options { value } description price sku }
          }
        }
      }`,
    };
  }

  public getProducts(filter?: string): Observable<PePosProductInterface[]> {
    return this.http
      .post(`${this.peProductsApiPath}/products`, this.productsGQL(filter))
      .pipe(
        map((request: PePosServerProductResponse) => request.data.getProducts.products
          .map((product): PePosProductInterface => {

            return {
              image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png', //'bag',
              name: product.title,
              description: product.description,
              priceAndCurrency: product.priceAndCurrency,
              id: product.id,
              price: product.price,
              variants: product.variants,
              currency: product.currency,
            };
          })),
        catchError((error) => {
          return throwError(error);
        }));
  }

  uploadImageWithProgress(
    container: string,
    file: File,
    returnShortPath = true,
  ): Observable<HttpEvent<UploadResponseInterface>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<UploadResponseInterface>(
      `${this.env.backend.media}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<UploadResponseInterface>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number((event.loaded / event.total * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${this.env.custom.storage}/${container}/${event.body.blobName}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError(() => {
        return of(null);
      }));
  }

}
