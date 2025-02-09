import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { TranslateService } from '@pe/i18n';

import { ProductsListEnvConfigService } from '../../config';
import { Product } from '../../interfaces';
import { ExceptionToolbarService } from '../../products-list/services';
import { SectionsService } from '../services';
import { ApiService } from './core.module';
import { ProductResolver } from './product.resolver';

describe('ProductResolver', () => {
  const BUSINESS_ID = 'businessId';

  let product: Product;

  let productResolver: ProductResolver;

  let listEnvServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let exceptionToolbarServiceSpy: jasmine.SpyObj<ExceptionToolbarService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  let sectionsServiceMock: SectionsService;
  let activatedRouteMock: ActivatedRouteSnapshot;

  beforeEach(() => {
    product = {
      id: 'productId',
    } as Product;

    listEnvServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('ProductsListEnvConfigService', ['getSlug']);
    listEnvServiceSpy.getSlug.and.returnValue(BUSINESS_ID);
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['getProduct']);
    apiServiceSpy.getProduct.and.returnValue(new Observable((observer) => {
      observer.next({
        data: {
          product,
        },
      });
      observer.complete();
    }));
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(new Promise((resolve) => { resolve(); }));
    exceptionToolbarServiceSpy = jasmine.createSpyObj<ExceptionToolbarService>('ExceptionToolbarService', ['show']);
    translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);

    sectionsServiceMock = {
      resetState$: new BehaviorSubject<boolean>(true),
    } as SectionsService;
    activatedRouteMock = {
      params: {
        productId: product.id,
      },
    } as unknown as ActivatedRouteSnapshot;

    TestBed.configureTestingModule({
      providers: [
        ProductResolver,
        { provide: ProductsListEnvConfigService, useValue: listEnvServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SectionsService, useValue: sectionsServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: ExceptionToolbarService, useValue: exceptionToolbarServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
      imports: [
      ],
    });

    productResolver = TestBed.get(ProductResolver);
  });

  it('#resolve should call api service and load product by id', (done) => {
    productResolver.resolve(activatedRouteMock).subscribe((result) => {
      expect(result.data.product).toEqual(product);
      expect(apiServiceSpy.getProduct).toHaveBeenCalledWith(product.id);
      done();
    });
  });

  it('#resolve should navigate to product list if product does not exist', (done) => {
    apiServiceSpy.getProduct.and.returnValue(new Observable((observer) => {
      observer.next({
        data: {
          product: null,
        },
      });
      observer.complete();
    }));

    const promiseMock = jasmine.createSpyObj<Promise<boolean>>('Promise', ['then']);
    promiseMock.then.and.callFake((fn: any) => {
      fn();

      expect(routerSpy.navigate).toHaveBeenCalled();
      expect(exceptionToolbarServiceSpy.show).toHaveBeenCalled();
      done();

      return new Promise(() => { });
    });

    routerSpy.navigate.and.returnValue(promiseMock);

    productResolver.resolve(activatedRouteMock).subscribe((result) => {
      expect(result.data.product).toBe(null);
    });
  });

  it('#resolve should be resolver with null if product should not be loaded', (done) => {
    sectionsServiceMock.resetState$.next(false);

    productResolver.resolve(activatedRouteMock).subscribe((result) => {
      expect(result).toBe(null);
      done();
    });
  });
});
