import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { of, Subject } from 'rxjs';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../../misc/services/destroy.service';
import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { PeDeleteCouponConfirmationDialog } from './delete-coupon-confirmation-dialog';

describe('PeDeleteCouponConfirmationDialog', () => {

  let fixture: ComponentFixture<PeDeleteCouponConfirmationDialog>;
  let component: PeDeleteCouponConfirmationDialog;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;
  let api: jasmine.SpyObj<PeCouponsApi>;

  beforeEach(async(() => {

    const peOverlayRefSpy = jasmine.createSpyObj<PeOverlayRef>('PeOverlayRef', ['close']);

    const apiSpy = jasmine.createSpyObj<PeCouponsApi>('PeCouponsApi', ['deleteCoupon']);

    const overlayDataMock = ['c-001', 'c-002'];

    const destroyMock = new Subject<void>();

    TestBed.configureTestingModule({
      declarations: [PeDeleteCouponConfirmationDialog],
      providers: [
        { provide: PeOverlayRef, useValue: peOverlayRefSpy },
        { provide: PeCouponsApi, useValue: apiSpy },
        { provide: EnvService, useValue: null },
        { provide: PE_OVERLAY_DATA, useValue: overlayDataMock },
        { provide: DestroyService, useValue: destroyMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeDeleteCouponConfirmationDialog);
      component = fixture.componentInstance;

      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;
      api = TestBed.inject(PeCouponsApi) as jasmine.SpyObj<PeCouponsApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    const envServiceMock = { businessData: null };

    /**
     * envService is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData is null
     */
    component = new PeDeleteCouponConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    component = new PeDeleteCouponConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    component = new PeDeleteCouponConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('light');

  });

  it('should set selectedCouponsIds on init', () => {

    component.ngOnInit();

    expect(component.selectedCouponsIds).toEqual(['c-001', 'c-002']);

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

  it('should handle save', () => {

    const selectedIds = ['c-001', 'c-002'];

    api.deleteCoupon.and.returnValue(of(null));

    component.selectedCouponsIds = selectedIds;
    component.onSave();

    expect(peOverlayRef.close).toHaveBeenCalledTimes(2);
    expect(peOverlayRef.close).toHaveBeenCalledWith(true);

  });

});
