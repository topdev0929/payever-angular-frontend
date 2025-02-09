import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PeAuthService } from '@pe/auth';
import { EnvService, PE_ENV } from '@pe/common';
import { ActualPeCouponsApi, PE_COUPONS_API_PATH } from './actual.coupons.api';

describe('ActualPeCouponsApi', () => {

  let service: ActualPeCouponsApi;
  let http: HttpTestingController;
  let envService: any;

  const couponId = 'c-001';
  const folderId = 'f-001';
  const couponsApiPath = 'api/coupons';
  function testAuthHeader(request: TestRequest) {
    expect(request.request.headers.get('Authorization')).toEqual('Bearer token');
  }

  beforeEach(() => {

    const envMock = {
      backend: {
        products: 'be-products',
        contacts: 'be-contacts',
      },
    };

    const authTokenServiceMock = { token: 'token' };

    const envServiceMock = { businessId: 'b-001' };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActualPeCouponsApi,
        { provide: PE_ENV, useValue: envMock },
        { provide: PE_COUPONS_API_PATH, useValue: couponsApiPath },
        { provide: PeAuthService, useValue: authTokenServiceMock },
        { provide: EnvService, useValue: envServiceMock },
      ],
    });

    service = TestBed.inject(ActualPeCouponsApi);
    http = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get coupons list', () => {

    const filter = { test: true };
    let url = `${couponsApiPath}/business/${envService.businessId}/coupons?undefined`;
    let req: TestRequest;

    /**
     * argument filter is undefined as default
     */
    service.getCouponsList().subscribe();

    req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

    /**
     * argument filter is set
     */
    url = url.replace('undefined', `filter=${JSON.stringify(filter)}`);

    service.getCouponsList(filter).subscribe();

    req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should post coupons', () => {

    const coupon = { _id: couponId };
    const url = `${couponsApiPath}/business/${envService.businessId}/folders`;

    service.postCoupons(coupon as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(coupon);
    testAuthHeader(req);

  });

  it('should get coupon by id', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}`;

    service.getCouponById(couponId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should get coupon extra field', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}/type-extra-fields`;

    service.getCouponExtraField(couponId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should get coupon eligibility by id', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}/eligibility`;

    service.getCouponEligibilityById(couponId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should get coupon by code', () => {

    const couponCode = 'coupon.code';
    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/by-code/${couponCode}`;

    service.getCouponByCode(couponCode).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should create coupon', () => {

    const coupon = { _id: couponId };
    const url = `${couponsApiPath}/business/${envService.businessId}/coupons`;

    service.createCoupon(coupon as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(coupon);
    testAuthHeader(req);

  });

  it('should post coupon', () => {

    const coupon = { _id: couponId };
    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}`;

    service.postCoupon(couponId, coupon as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(coupon);
    testAuthHeader(req);

  });

  it('should update coupon', () => {

    const coupon = { _id: couponId };
    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}`;

    service.updateCoupon(couponId, coupon as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(coupon);
    testAuthHeader(req);

  });

  it('should delete coupon', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/coupons/${couponId}`;

    service.deleteCoupon(couponId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');
    testAuthHeader(req);

  });

  it('should get folders', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/folders`;

    service.getFolders().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should get coupons folders', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/folders/tree`;

    service.getCouponsFolders().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should get coupons folder by id', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/folders/${folderId}`;

    service.getCouponsFolderById(folderId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    testAuthHeader(req);

  });

  it('should post coupons folder', () => {

    const folder = { _id: folderId };
    const url = `${couponsApiPath}/business/${envService.businessId}/folders`;

    service.postCouponsFolder(folder).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(folder);
    testAuthHeader(req);

  });

  it('should update coupons folder', () => {

    const folder = { _id: folderId };
    const url = `${couponsApiPath}/business/${envService.businessId}/folders/${folderId}`;

    service.updateCouponsFolder(folderId, folder).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(folder);
    testAuthHeader(req);

  });

  it('should delete coupons folder', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/folders/${folderId}`;

    service.deleteCouponsFolder(folderId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');
    testAuthHeader(req);

  });

  it('should update coupon folder', () => {

    const arg = {
      couponId,
      parentFolder: 'f-001',
    };
    const url = `${couponsApiPath}/business/${envService.businessId}/folders/item/${couponId}`;

    service.updateCouponFolder(arg).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ parentFolder: 'f-001' });
    testAuthHeader(req);

  });

  it('should get products', () => {

    const url = 'be-products/products';

    service.getProducts().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');

  });

  it('should get categories', () => {

    const url = 'be-products/products';

    service.getCategories().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');

  });

  it('should get channels', () => {

    const url = `${couponsApiPath}/business/${envService.businessId}/channel-set/type/`;

    service.getChannels().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get contact groups', () => {

    const url = `be-contacts/graphql`;

    service.getContactGroups().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');

  });

  it('should get contacts', () => {

    const url = `be-contacts/graphql`;

    service.getContacts().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');

  });

});
