import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { EnvService } from '@pe/common';
import { EMPTY, of, Subject } from 'rxjs';
import {
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from '../../../misc/interfaces/coupon.enum';
import { PeFolder } from '../../../misc/interfaces/folder.interface';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../../misc/services/destroy.service';
import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { PeMoveToFolderDialog } from './move-to-folder.dialog';

describe('PeMoveToFolderDialog', () => {

  let fixture: ComponentFixture<PeMoveToFolderDialog>;
  let component: PeMoveToFolderDialog;
  let envService: any;
  let api: jasmine.SpyObj<PeCouponsApi>;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;

  beforeEach(async(() => {

    const peOverlayRefSpy = jasmine.createSpyObj<PeOverlayRef>('PeOverlayRef', ['close']);

    const overlayDataMock = { id: 'c-001' };

    const envServiceMock = {
      businessId: 'b-001',
      businessData: null,
    };

    const apiSpy = jasmine.createSpyObj<PeCouponsApi>('PeCouponsApi', {
      getCouponsFolders: EMPTY,
    });

    const destroyMock = new Subject<void>();

    TestBed.configureTestingModule({
      declarations: [PeMoveToFolderDialog],
      providers: [
        FormBuilder,
        { provide: PeOverlayRef, useValue: peOverlayRefSpy },
        { provide: PE_OVERLAY_DATA, useValue: overlayDataMock },
        { provide: EnvService, useValue: envServiceMock },
        { provide: PeCouponsApi, useValue: apiSpy },
        { provide: DestroyService, useValue: destroyMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMoveToFolderDialog);
      component = fixture.componentInstance;

      envService = TestBed.inject(EnvService);
      api = TestBed.inject(PeCouponsApi) as jasmine.SpyObj<PeCouponsApi>;
      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    /**
     * envService.businessData is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(PeMoveToFolderDialog);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PeMoveToFolderDialog);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should create move to folder form on construct', () => {

    expect(component.moveToFolderForm).toBeDefined();
    expect(component.moveToFolderForm.value).toEqual({
      businessId: 'b-001',
      limits: {
        limitOneUsePerCustomer: false,
        limitUsage: false,
        limitUsageAmount: null,
      },
      name: 'name',
      type: {
        folderData: PeFolder,
        appliesToProducts: [],
        appliesToCategories: [],
        buyRequirementType: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems,
        buyQuantity: null,
        buyType: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories,
        buyProducts: [],
        buyCategories: [],
        discountValue: null,
        freeShippingType: PeCouponTypeFreeShippingTypeEnum.AllCountries,
        freeShippingToCountries: [],
        getType: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories,
        getQuantity: null,
        getProducts: [],
        getCategories: [],
        getFolders: [],
        getDiscountType: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage,
        getDiscountValue: null,
        maxUsesPerOrder: false,
        maxUsesPerOrderValue: null,
        minimumRequirements: PeCouponTypeMinimumRequirementsEnum.None,
        minimumRequirementsPurchaseAmount: null,
        minimumRequirementsQuantityOfItems: null,
        type: PeCouponTypeEnum.Percentage,
      },
    });

  });

  it('should get coupons folder', () => {

    const treeMock = [
      { _id: 'f-001', name: 'Folder 1' },
      { _id: 'f-002', name: 'Folder 2' },
    ];
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const nextSpy = spyOn(component.refreshSubject$, 'next');

    api.getCouponsFolders.and.returnValue(of(treeMock));

    component.folders = null;
    component[`getCouponsFolders`]().subscribe().unsubscribe();

    expect(component.folders).toBeDefined();
    expect(component.folders).toEqual(treeMock);
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should handle ng init', () => {

    const getSpy = spyOn<any>(component, 'getCouponsFolders').and.returnValue(of([]));

    component.ngOnInit();

    expect(getSpy).toHaveBeenCalled();

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

  it('should handle save', () => {

    component.moveToFolderForm.patchValue({
      type: {
        folderData: { id: 'f-001', _id: 'f-001' },
      },
    });

    component.onSave();

    expect(peOverlayRef.close).toHaveBeenCalledWith({
      folderId: 'f-001',
      couponId: 'c-001',
    });

  });

});
