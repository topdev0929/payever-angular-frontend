import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';

import { EnvironmentConfigService } from '../../modules/environment-config';
import { BusinessResolver } from './business.resolver';

describe('BusinessResolver', () => {
  let backendConfig: any;
  let httpClientSpy: HttpClient;
  let businessResolver: BusinessResolver;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    backendConfig = {
      users: 'test://users',
    };

    const configService: EnvironmentConfigService = new EnvironmentConfigService();
    configService.addConfig({ backend: backendConfig });
    TestBed.configureTestingModule({
      providers: [
        BusinessResolver,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: EnvironmentConfigService, useValue: configService },
      ],
    });

    businessResolver = TestBed.get(BusinessResolver);
  });

  it('should resolve business via http get request', () => {
    const route: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
    route.params = { slug: 'testSlug' };
    const expectedUrl = `${backendConfig.users}/api/business/${route.params.slug}`;

    businessResolver.resolve(route, null);
    /* tslint:disable-next-line: no-unbound-method */
    expect(httpClientSpy.get).toHaveBeenCalledWith(expectedUrl);
  });
});
