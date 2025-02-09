import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';

import { ProductsListEnvConfigService } from '../modules/_products/src/modules/config';
import { BusinessGuard } from './business-guard.service';

describe('BusinessGuard', () => {
  let businessGuard: BusinessGuard;
  let productsListEnvConfigService: ProductsListEnvConfigService;

  beforeEach(() => {
    productsListEnvConfigService = new ProductsListEnvConfigService();
    TestBed.configureTestingModule({
      providers: [
        BusinessGuard,
        { provide: ProductsListEnvConfigService, useFactory: () => productsListEnvConfigService },
      ],
    });

    businessGuard = TestBed.get(BusinessGuard);
  });

  it('#canActivate should allow activation if route params `slug` is not present', () => {
    const slug = 'slug';
    const route: ActivatedRouteSnapshot = {
      params: { slug: null }, // No slug in route params
    } as any;

    productsListEnvConfigService.setConfig({ slug });

    expect(businessGuard.canActivate(route, null)).toBe(true);
    expect(productsListEnvConfigService.getSlug()).toBe(slug);
  });

  it('#canActivate should allow activation and update config if slug is privided', () => {
    const slug = 'custom-slug';
    const route: ActivatedRouteSnapshot = {
      params: { slug }, // slug is provided
    } as any;

    productsListEnvConfigService.setConfig({ slug: 'default-slug' });
    expect(productsListEnvConfigService.getSlug()).not.toBe(slug);

    expect(businessGuard.canActivate(route, null)).toBe(true);
    expect(productsListEnvConfigService.getSlug()).toBe(slug);
  });
});
