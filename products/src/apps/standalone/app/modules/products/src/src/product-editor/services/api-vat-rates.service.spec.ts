import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EnvironmentConfigService, NodeJsBackendConfigInterface } from '../../environment-config';
import { VatRatesApiService } from './api-vat-rates.service';

describe('VatRatesApiService', () => {
  let vatRatesApiService: VatRatesApiService;

  let envConfigServiceSpy: jasmine.SpyObj<EnvironmentConfigService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    envConfigServiceSpy = jasmine.createSpyObj<EnvironmentConfigService>('EnvironmentConfigService', ['getBackendConfig']);
    envConfigServiceSpy.getBackendConfig.and.returnValue({
      common: 'test://common',
    } as NodeJsBackendConfigInterface);
    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        VatRatesApiService,
        { provide: EnvironmentConfigService, useValue: envConfigServiceSpy },
        { provide: HttpClient, useValue: httpClientSpy },
      ],
      imports: [
      ],
    });

    vatRatesApiService = TestBed.get(VatRatesApiService);
  });

  it('#getVarRates should get vat rates for country', () => {
    const countryId = 'country_id';
    vatRatesApiService.getVarRates(countryId);

    expect(httpClientSpy.get).toHaveBeenCalled();
    const url = httpClientSpy.get.calls.argsFor(0)[0];
    expect(url).toContain(countryId);
  });
});
