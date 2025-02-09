import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { PE_COUPONS_API_PATH } from './actual.coupons.api';
import { PebCouponPackagesService } from './coupon-package.service';

describe('PebCouponPackagesService', () => {

  let service: PebCouponPackagesService;
  let http: HttpTestingController;

  const businessId = 'b-001';

  beforeEach(() => {

    const envServiceMock = { businessId };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebCouponPackagesService,
        { provide: PE_COUPONS_API_PATH, useValue: 'api/coupons' },
        { provide: EnvService, useValue: envServiceMock },
      ],
    });

    service = TestBed.inject(PebCouponPackagesService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get business id', () => {

    expect(service[`businessId`]).toEqual(businessId);

  });

  it('should get tree data', () => {

    const url = service[`baseUrl`];

    service.getTreeData().subscribe(tree => expect(tree).toEqual([{
      name: 'coupon-app.packages_nav.boxes',
      image: 'assets/shipping.svg',
      editing: true,
      children: [
        {
          name: '',
          image: 'assets/shipping.svg',
          editing: true,
        },
      ],
    }]));

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete package', () => {

    const id = 'c-001';
    const url = `${service[`baseUrl`]}/${id}`;

    service.deletePackage(id).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  afterAll(() => {

    http.verify();

  });

});
