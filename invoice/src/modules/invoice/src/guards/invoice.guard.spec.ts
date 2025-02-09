import { EMPTY, of, throwError } from 'rxjs';
import { PeInvoiceApi } from '../services/abstract.invoice.api';
import { PebInvoiceGuard } from './invoice.guard';

describe('PebInvoiceGuard', () => {

  let guard: PebInvoiceGuard;
  let api: jasmine.SpyObj<PeInvoiceApi>;
  let envService: any;

  beforeEach(() => {

    api = jasmine.createSpyObj<PeInvoiceApi>('PeInvoiceApi', [
      'getInvoiceList',
      'getSingleInvoice',
      'createInvoice',
    ]);

    envService = {
      shopId: undefined,
      businessData: {
        name: 'Invoice',
      },
    };

    guard = new PebInvoiceGuard(api, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      firstChild: undefined,
      data: undefined,
    } as any;
    const sitesList = [
      { id: 'site-001', isDefault: false },
      { id: 'site-002', isDefault: false },
      { id: 'site-003', isDefault: true },
    ];
    const site = {
      id: 'site-001',
      name: 'Site',
      isDefault: false,
    };

    // w/o route
    // w/o shops
    // w/ error
    api.getInvoiceList.and.returnValue(EMPTY);
    api.getSingleInvoice.and.returnValue(of([]));
    api.createInvoice.and.returnValue(throwError('test error'));

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(false));
    expect(envService.shopId).toBeUndefined();

    // w/o firstChild
    // w/o error
    // isDefault = FALSE
    api.createInvoice.and.returnValue(of(site) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

    // w/o firstChild.firstChild
    // isDefault = TRUE
    route.firstChild = {
      firstChild: undefined,
    };
    site.isDefault = true;

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

    // w/ shops
    api.getInvoiceList.and.returnValue(of(sitesList) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(sitesList[2].id);
    expect(route.data).toEqual({ site: sitesList[2] });

    // w/ route.firstChild.firstChild.params.shopId
    route.firstChild.firstChild = {
      params: {
        siteId: 'site-001',
      },
    };

    api.getSingleInvoice.and.returnValue(of(site) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

  });

});
