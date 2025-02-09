import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EnvironmentConfigService } from '../../environment-config';
import { ProductsListEnvConfigService } from '../../config';
import { ChannelInterface } from '../interfaces';
import { ChannelsService } from './api-marketplaces.service';

import { ApolloTestingModule } from 'apollo-angular/testing';

describe('MarketplacesApiService', () => {
  let channelsApiService: ChannelsService;

  let envConfigServiceSpy: jasmine.SpyObj<EnvironmentConfigService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let productsListEnvConfigServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;

  beforeEach(() => {
    envConfigServiceSpy = jasmine.createSpyObj<EnvironmentConfigService>('EnvironmentConfigService', ['getBackendConfig']);
    productsListEnvConfigServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('EnvironmentConfigService', ['getSlug']);
    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        ChannelsService,
        { provide: ActivatedRoute, useFactory: () => ({}) },
        { provide: EnvironmentConfigService, useValue: envConfigServiceSpy },
        { provide: ProductsListEnvConfigService, useValue: productsListEnvConfigServiceSpy },
        { provide: HttpClient, useValue: httpClientSpy },
      ],
      imports: [
        ApolloTestingModule.withClients(['products', 'marketing']),
      ],
    });

    channelsApiService = TestBed.get(ChannelsService);
  });

  it('#channels$ should return observable based on http client request', () => {
    const businessId = 'test-slug';
    const config: any = { pos: 'test://pos' };
    const data: ChannelInterface[] = [];
    const expectedTerminalsHttpGetUrl = `${config.pos}/api/business/${businessId}/terminal`;
    const expectedShopsHttpGetUrl = `${config.shops}/api/business/${businessId}/shop`;

    envConfigServiceSpy.getBackendConfig.and.returnValue(config);
    productsListEnvConfigServiceSpy.getSlug.and.returnValue(businessId);
    httpClientSpy.get.and.returnValue(of(data));

    channelsApiService.channels$.subscribe(result => {
      expect(httpClientSpy.get).toHaveBeenCalledWith(expectedTerminalsHttpGetUrl);
      expect(httpClientSpy.get).toHaveBeenCalledWith(expectedShopsHttpGetUrl);

      expect(result).toEqual(data);
    });
  });
});
