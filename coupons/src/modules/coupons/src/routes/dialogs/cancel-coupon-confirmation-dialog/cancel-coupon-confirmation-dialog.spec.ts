import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { PeOverlayRef } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { PeCancelCouponConfirmationDialog } from './cancel-coupon-confirmation-dialog';

describe('PeCancelCouponConfirmationDialog', () => {

  let fixture: ComponentFixture<PeCancelCouponConfirmationDialog>;
  let component: PeCancelCouponConfirmationDialog;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;

  beforeEach(async(() => {

    const peOverlayRefSpy = jasmine.createSpyObj<PeOverlayRef>('PeOverlayRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [PeCancelCouponConfirmationDialog],
      providers: [
        { provide: PeOverlayRef, useValue: peOverlayRefSpy },
        { provide: EnvService, useValue: null },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCancelCouponConfirmationDialog);
      component = fixture.componentInstance;

      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;

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
    component = new PeCancelCouponConfirmationDialog(null, envServiceMock as any);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    component = new PeCancelCouponConfirmationDialog(null, envServiceMock as any);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    component = new PeCancelCouponConfirmationDialog(null, envServiceMock as any);

    expect(component.theme).toEqual('light');

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

  it('should handle save', () => {

    component.onSave();

    expect(peOverlayRef.close).toHaveBeenCalledWith(true);

  });

});
