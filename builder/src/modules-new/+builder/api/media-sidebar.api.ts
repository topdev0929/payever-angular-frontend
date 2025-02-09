import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// import { PebAbstractMediaSidebarApi, PebMediaSidebarCollection, PebMediaSidebarCollectionFilters, PebMediaSidebarCollectionType } from '@pe/builder-ui';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { BlobUploadService } from '../services/blob-upload.service';
import { ThemeContextStore } from '../utils/context.store';

@Injectable({ providedIn: 'root'})
export class BuilderMediaSidebarApi {
  constructor(
    private readonly config: EnvironmentConfigService,
    private readonly contextStore: ThemeContextStore,
    private readonly httpClient: HttpClient,
    private blobUploadService: BlobUploadService,
  ) {}

  get builderMediaApi(): string {
    return `${this.config.getConfig().backend['builderMedia']}/api`;
  }

  get mediaApi(): string {
    return `${this.config.getConfig().backend.media}/api`;
  }

  get businessId(): string {
    return this.contextStore.context.businessId;
  }

  // getCollection(
  //   filters: PebMediaSidebarCollectionFilters,
  //   filterTitles: { [key: string]: string[] },
  //   type: PebMediaSidebarCollectionType,
  // ): Observable<PebMediaSidebarCollection> {
  //   return this.httpClient.get<PebMediaSidebarCollection>(`${this.builderMediaApi}/selection?${this.prepareFilters(filters, filterTitles, type)}`);
  // }

  // getCategories(
  //   type: PebMediaSidebarCollectionType,
  // ): Observable<string[]> {
  //   return this.httpClient.get<string[]>(`${this.builderMediaApi}/selection/categories?type=${type}`);
  // }

  // getFormats(
  //   type: PebMediaSidebarCollectionType,
  // ): Observable<string[]> {
  //   return this.httpClient.get<string[]>(`${this.builderMediaApi}/selection/formats?type=${type}`);
  // }

  uploadMedia(file: File): Observable<string> {
    return this.blobUploadService.createBlob(this.businessId, file).pipe(
      switchMap(sourceUrl => this.httpClient.post<string>(`${this.builderMediaApi}/business/${this.businessId}`, {
        type: 'image',
        sourceUrl,
      })),
    );
  }

  // getBusinessCollection(type: PebMediaSidebarCollectionType): Observable<PebMediaSidebarCollection> {
  //   return this.httpClient.get<PebMediaSidebarCollection>(`${this.builderMediaApi}/business/${this.businessId}?page=1&perPage=100&type=${type}`);
  // }

  // tslint:disable-next-line: prefer-function-over-method
  private prepareFilters(
    filters: {[key: string]: string | string[] | boolean},
    filterTitles: {[key: string]: string[]},
    type: string,
  ): any {
    const preparedFilters = Object.keys(filters).reduce((acc, curr) => {
      return [
        ...acc,
        Array.isArray(filters[curr]) ?
        {
          field: curr,
          condition: 'is',
          value: (filters[curr] as string[]).filter(v => !!v).map((_, index) => (filterTitles[curr][index])),
        } :
        { [curr]: filters[curr] },
      ];
    }, []);

    preparedFilters.push({
      field: 'type',
      condition: 'is',
      value: type,
    });

    let filterCounter = -1;

    return preparedFilters.reduce((acc, curr) => {
      if (curr && curr.hasOwnProperty('field') && (Array.isArray(curr.value) && curr.value.length) || typeof curr.value === 'string') {
        filterCounter += 1;

        return `${acc}filters[${filterCounter}][field]=${curr.field}&filters[${filterCounter}][condition]=is&${Array.isArray(curr.value) ? curr.value.map((v, i) => `filters[${filterCounter}][value][${i}]=${v}`).join('&') : `filters[${filterCounter}][value]=${curr.value}`}&`;
      }

      return `${acc}${Object.keys(curr)[0]}=${curr[Object.keys(curr)[0]]}&`;
    }, 'page=1&perPage=100&');
  }

}
