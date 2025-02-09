import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { EnvService, PE_ENV } from '@pe/common';
import { PeDateTimePickerService } from '@pe/ui';
import { cloneDeep } from 'lodash-es';
import * as moment_ from 'moment';
import * as rxjs from 'rxjs';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { PeCouponCustomerGroup } from '../../misc/interfaces/coupon-customer-group.interface';
import { PeCouponCustomer } from '../../misc/interfaces/coupon-customer.interface';
import {
  PeCouponsStatusEnum,
  PeCouponTypeAppliedToEnum,
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeCustomerEligibilityEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from '../../misc/interfaces/coupon.enum';
import { PeCoupon } from '../../misc/interfaces/coupon.interface';
import {
  PeCouponsOverlayService,
  PeOverlayRef,
  PE_OVERLAY_DATA,
} from '../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../misc/services/destroy.service';
import { PeCouponsApi } from '../../services/abstract.coupons.api';
import {
  PeCancelCouponConfirmationDialog,
} from '../dialogs/cancel-coupon-confirmation-dialog/cancel-coupon-confirmation-dialog';
import { PeCouponsFormComponent } from './coupons-form.component';
const moment = moment_;

describe('PeCouponsFormComponent', () => {

  let fixture: ComponentFixture<PeCouponsFormComponent>;
  let component: PeCouponsFormComponent;
  let dialogRef: any;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let envService: EnvService;
  let overlayData: any;
  let iconRegistry: jasmine.SpyObj<MatIconRegistry>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let api: jasmine.SpyObj<PeCouponsApi>;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;
  let overlayService: jasmine.SpyObj<PeCouponsOverlayService>;

  beforeAll(() => {

    Object.defineProperty(rxjs, 'throwError', {
      value: rxjs.throwError,
      writable: true,
    });

  });

  beforeEach(async(() => {

    dialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(EMPTY),
    };
    const matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', {
      open: dialogRef,
    });

    const peOverlayRefMock = {
      backdropClick: new Subject(),
      close: jasmine.createSpy('close'),
    };

    const apiSpy = jasmine.createSpyObj<PeCouponsApi>('PeCouponsApi', [
      'getCouponById',
      'updateCoupon',
      'createCoupon',
      'getProducts',
      'getContactGroups',
      'getContacts',
      'getCategories',
    ]);

    const envServiceMock = {
      businessId: 'b-001',
      businessData: null,
    };

    const overlayServiceSpy = jasmine.createSpyObj<PeCouponsOverlayService>('PeCouponsOverlayService', ['open']);

    const overlayDataMock = {
      id: null,
      customersSource: [{ id: 'cs-001' }],
      countries: [{
        _id: 'DE',
        title: 'Germany',
      }],
    };

    const iconRegistrySpy = jasmine.createSpyObj<MatIconRegistry>('MatIconRegistry', ['addSvgIcon']);

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'bypassed.resource.url',
    });

    const envMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    const destroyMock = new Subject<void>();

    TestBed.configureTestingModule({
      declarations: [PeCouponsFormComponent],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: PeOverlayRef, useValue: peOverlayRefMock },
        { provide: EnvService, useValue: envMock },
        { provide: PeCouponsOverlayService, useValue: overlayServiceSpy },
        { provide: PeCouponsApi, useValue: apiSpy },
        { provide: PeDateTimePickerService, useValue: {} },
        { provide: PE_OVERLAY_DATA, useValue: overlayDataMock },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PE_ENV, useValue: envMock },
        { provide: DestroyService, useValue: destroyMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsFormComponent);
      component = fixture.componentInstance;

      matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      envService = TestBed.inject(EnvService);
      overlayData = TestBed.inject(PE_OVERLAY_DATA);
      iconRegistry = TestBed.inject(MatIconRegistry) as jasmine.SpyObj<MatIconRegistry>;
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      api = TestBed.inject(PeCouponsApi) as jasmine.SpyObj<PeCouponsApi>;
      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;
      overlayService = TestBed.inject(PeCouponsOverlayService) as jasmine.SpyObj<PeCouponsOverlayService>;

    });

  }));

  it('should be defined', () => {

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

    fixture = TestBed.createComponent(PeCouponsFormComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PeCouponsFormComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should add svg icon on construct', () => {

    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('c-cdn/icons/app-icon-pos.svg');
    expect(iconRegistry.addSvgIcon).toHaveBeenCalledWith('point-of-sale', 'bypassed.resource.url');

  });

  it('should handle ng init', () => {

    const getSpy = spyOn(component, 'getCoupon');
    const setupInputChangesSpy = spyOn(component, 'setupInputChanges');
    const setupDismissSpy = spyOn(component, 'setupDismiss');
    const setSpy = spyOn(component.couponForm.get('type').get('freeShippingToCountries'), 'setValue');

    /**
     * overlayData.id is null
     */
    component.ngOnInit();

    expect(component.customersSource).toEqual(overlayData.customersSource);
    expect(component.countries).toEqual(overlayData.countries);
    expect(getSpy).not.toHaveBeenCalled();
    expect(setupInputChangesSpy).toHaveBeenCalled();
    expect(setupDismissSpy).toHaveBeenCalled();

    /**
     * overlayData.id is set
     */
    overlayData.id = 'c-001';

    component.ngOnInit();

    expect(getSpy).toHaveBeenCalledWith('c-001');

    /**
     * test freeShippingType change
     * value is not equal to PeCouponTypeFreeShippingTypeEnum.AllCountries
     */
    component.couponForm.patchValue({
      type: {
        freeShippingType: PeCouponTypeFreeShippingTypeEnum.SelectedCountries,
      },
    });

    expect(setSpy).not.toHaveBeenCalled();

    /**
     * value is equal to PeCouponTypeFreeShippingTypeEnum.AllCountries
     */
    component.couponForm.patchValue({
      type: {
        freeShippingType: PeCouponTypeFreeShippingTypeEnum.AllCountries,
      },
    });

    expect(setSpy).toHaveBeenCalledWith([]);

  });

  it('should add to array', () => {

    const element = {
      id: 'e-001',
      _id: 'e-001',
    };
    const array = [];

    /**
     * argument element is null
     * argument array is [] (empty array)
     * argument arrayName is undefined as default
     */
    component.addToArray(null, array);

    expect(array).toEqual([null]);

    /**
     * argument element is set
     * argument array is not empty
     */
    component.addToArray(element, array);

    expect(array).toEqual([null, element]);

    /**
     * argument arrayName is 'customers'
     * argument array already contains element
     * so it will not be pushed to array
     */
    delete array[1].id;

    component.customersSource = [element] as any;
    component.addToArray(element, array, 'customers');

    expect(array).toEqual([null, element]);

    /**
     * argument arrayName is 'groupsOfCustomers'
     */
    array.splice(0, array.length);

    component.groupsOfCustomersSource = [element] as any;
    component.addToArray(element, array, 'groupsOfCustomers');

    expect(array).toEqual([element]);

    /**
     * argument arrayName is 'countries'
     */
    array.splice(0, array.length);

    component.addToArray(element, array, 'countries');

    expect(array).toEqual([{ _id: element._id }]);

  });

  it('should get from array', () => {

    const element = {
      id: null,
      _id: 'e-001',
    };
    const array = [element];

    expect(component.getFromArray(array, element._id)).toEqual(element);

  });

  it('should remove from array', () => {

    const array = [
      {
        id: null,
        _id: 'e-001',
      },
      {
        id: 'e-002',
        _id: 'e-002',
      },
    ];

    component.removeFromArray(array, 0);

    expect(array).toEqual([{
      id: 'e-002',
      _id: 'e-002',
    }]);

  });

  it('should get coupon', () => {

    const couponMock: PeCoupon = {
      _id: 'c-001',
      businessId: 'b-001',
      code: 'code',
      channelSets: ['ch-001'],
      customerEligibility: PeCouponTypeCustomerEligibilityEnum.SpecificCustomers,
      customerEligibilityCustomerGroups: null,
      customerEligibilitySpecificCustomers: null,
      description: 'desc',
      endDate: null,
      limits: {
        limitOneUsePerCustomer: false,
        limitUsage: false,
        limitUsageAmount: 0,
      },
      name: 'Coupon 1',
      startDate: null,
      status: 'status',
      type: {
        type: PeCouponTypeEnum.FreeShipping,
      },
    };
    const customerSource: PeCouponCustomer = {
      id: 'u-001',
      businessId: 'b-001',
      type: 'type',
      contactFields: {
        nodes: []
      },
    };
    const groupOfCustomersSource: PeCouponCustomerGroup = {
      id: 'cg-001',
      businessId: 'b-001',
      name: 'Customer Group 1',
      isDefault: true,
    };
    const product = { _id: 'prod-001', title: 'Product 1' };
    const category = { _id: 'cat-001', title: 'Category 1' };
    const markSpy = spyOn(component[`changeDetectorRef`], 'markForCheck');

    component.customersSource = [customerSource];

    /**
     * The following props of the coupon are null
     * 
     * customerEligibilityCustomerGroups
     * customerEligibilitySpecificCustomers
     * type.appliesToProducts
     * type.buyProducts
     * type.buyCategories
     * type.appliesToCategories
     * type.freeShippingToCountries
     * type.getProducts
     * type.getCategories
     * startDate
     * endDate
     */
    api.getCouponById.and.returnValue(of(cloneDeep(couponMock)));

    component.edit = false;
    component.getCoupon(couponMock._id);

    expect(api.getCouponById).toHaveBeenCalledWith(couponMock._id);
    expect(component.edit).toBe(true);
    expect(component.coupon).toEqual(couponMock);
    let formValue = component.couponForm.value;
    expect(component.couponForm.getRawValue().code).toEqual(couponMock.code);
    expect(formValue.customerEligibility).toEqual(couponMock.customerEligibility);
    expect(formValue.customerEligibilityCustomerGroups).toBeNull();
    expect(formValue.customerEligibilitySpecificCustomers).toBeNull();
    expect(formValue.description).toEqual(couponMock.description);
    expect(formValue.limits).toEqual(couponMock.limits);
    expect(formValue.name).toEqual(couponMock.name);
    expect(formValue.type.type).toEqual(PeCouponTypeEnum.FreeShipping);
    expect(component.couponForm.controls.code.disabled).toBe(true);
    expect(markSpy).toHaveBeenCalled();

    /**
     * The following props of the coupon are set
     * 
     * customerEligibilityCustomerGroups
     * customerEligibilitySpecificCustomers
     * type.appliesToProducts
     * type.buyProducts
     * type.buyCategories
     * type.appliesToCategories
     * type.freeShippingToCountries
     * type.getProducts
     * type.getCategories
     * startDate
     * endDate
     * 
     * component.groupsOfCustomersSource is null
     * component.products is null
     * component.categories is null
     */
    markSpy.calls.reset();

    couponMock.customerEligibilityCustomerGroups = ['cg-001'];
    couponMock.customerEligibilitySpecificCustomers = ['u-001'];
    couponMock.type.appliesToProducts = ['prod-001'];
    couponMock.type.buyProducts = ['prod-001'];
    couponMock.type.buyCategories = ['cat-001'];
    couponMock.type.appliesToCategories = ['cat-001'];
    couponMock.type.freeShippingToCountries = ['DE'];
    couponMock.type.getProducts = ['prod-001'];
    couponMock.type.getCategories = ['cat-001'];
    couponMock.startDate = new Date(2021, 4, 1);
    couponMock.endDate = new Date(2021, 4, 31);

    api.getCouponById.and.returnValue(of(cloneDeep(couponMock)));

    component.edit = false;
    component.groupsOfCustomersSource = null;
    component.products = null;
    component.categories = null;
    component.countries = [{ _id: 'DE', title: 'Germany' }];
    component.couponForm.controls.code.enable();
    component.getCoupon(couponMock._id);

    expect(component.edit).toBe(true);
    expect(component.coupon).toEqual({
      ...couponMock,
      customerEligibilityCustomerGroups: [undefined],
      customerEligibilitySpecificCustomers: [customerSource],
      type: {
        type: PeCouponTypeEnum.FreeShipping,
        appliesToProducts: [undefined],
        buyProducts: [undefined],
        appliesToCategories: [undefined],
        buyCategories: [undefined],
        freeShippingToCountries: [{ _id: 'DE' }],
        getProducts: [undefined],
        getCategories: [undefined],
      },
    });
    formValue = component.couponForm.value;
    expect(component.couponForm.getRawValue().code).toEqual(couponMock.code);
    expect(formValue.customerEligibilityCustomerGroups).toEqual([undefined]);
    expect(formValue.customerEligibilitySpecificCustomers).toEqual([customerSource]);
    expect(formValue.type.appliesToProducts).toEqual([undefined]);
    expect(formValue.type.buyProducts).toEqual([undefined]);
    expect(formValue.type.appliesToCategories).toEqual([undefined]);
    expect(formValue.type.buyCategories).toEqual([undefined]);
    expect(formValue.type.freeShippingToCountries).toEqual([{ _id: 'DE' }]);
    expect(formValue.type.getProducts).toEqual([undefined]);
    expect(formValue.type.getCategories).toEqual([undefined]);
    expect(formValue.type.buyCategories).toEqual([undefined]);
    expect(formValue.startDate).toEqual(couponMock.startDate);
    expect(formValue.startDateDate).toEqual('01.05.2021');
    expect(formValue.startDateTime).toEqual('12:00');
    expect(formValue.setEndDate).toBe(true);
    expect(formValue.endDate).toEqual(couponMock.endDate);
    expect(formValue.endDateDate).toEqual('31.05.2021');
    expect(formValue.endDateTime).toEqual('12:00');
    expect(component.couponForm.controls.code.disabled).toBe(true);
    expect(markSpy).toHaveBeenCalled();

    /**
     * component.groupsOfCustomersSource is set
     * component.products is set
     * component.categories is set
     */
    markSpy.calls.reset();
    api.getCouponById.and.returnValue(of(cloneDeep(couponMock)));

    component.edit = false;
    component.groupsOfCustomersSource = [groupOfCustomersSource];
    component.products = [product] as any;
    component.categories = [category] as any;
    component.couponForm.controls.code.enable();
    component.getCoupon(couponMock._id);

    expect(component.edit).toBe(true);
    expect(component.coupon).toEqual({
      ...couponMock,
      customerEligibilityCustomerGroups: [groupOfCustomersSource],
      customerEligibilitySpecificCustomers: [customerSource],
      type: {
        type: PeCouponTypeEnum.FreeShipping,
        appliesToProducts: [product] as any,
        buyProducts: [product] as any,
        appliesToCategories: [category] as any,
        buyCategories: [category] as any,
        freeShippingToCountries: [{ _id: 'DE' }],
        getProducts: [product] as any,
        getCategories: [category] as any,
      },
    });
    formValue = component.couponForm.value;
    expect(component.couponForm.getRawValue().code).toEqual(couponMock.code);
    expect(formValue.customerEligibilityCustomerGroups).toEqual([groupOfCustomersSource]);
    expect(formValue.customerEligibilitySpecificCustomers).toEqual([customerSource]);
    expect(formValue.type.appliesToProducts).toEqual([product]);
    expect(formValue.type.buyProducts).toEqual([product]);
    expect(formValue.type.appliesToCategories).toEqual([category]);
    expect(formValue.type.buyCategories).toEqual([category]);
    expect(formValue.type.freeShippingToCountries).toEqual([{ _id: 'DE' }]);
    expect(formValue.type.getProducts).toEqual([product]);
    expect(formValue.type.getCategories).toEqual([category]);
    expect(formValue.type.buyCategories).toEqual([category]);
    expect(formValue.startDate).toEqual(couponMock.startDate);
    expect(formValue.startDateDate).toEqual('01.05.2021');
    expect(formValue.startDateTime).toEqual('12:00');
    expect(formValue.setEndDate).toBe(true);
    expect(formValue.endDate).toEqual(couponMock.endDate);
    expect(formValue.endDateDate).toEqual('31.05.2021');
    expect(formValue.endDateTime).toEqual('12:00');
    expect(component.couponForm.controls.code.disabled).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should track item', () => {

    const item = { _id: 'c-001' };

    expect(component.trackItem(0, item)).toEqual('c-001');

  });

  it('should generate code', () => {

    component.couponForm.patchValue({ code: null });
    component.generateCode();

    expect(component.couponForm.value.code.length).toBe(12);

  });

  it('should setup input changes', () => {

    const spies = {
      getProducts: spyOn<any>(component, 'getProducts'),
      getCategories: spyOn<any>(component, 'getCategories'),
      getGroupsOfCustomers: spyOn<any>(component, 'getGroupsOfCustomers'),
      getCustomers: spyOn<any>(component, 'getCustomers'),
    };

    component.setupInputChanges();

    /**
     * test appliesTo changes
     * value is 'SPECIFIC_PRODUCTS'
     */
    component.couponForm.patchValue({
      type: {
        appliesTo: 'SPECIFIC_PRODUCTS',
      },
    });

    expect(spies.getProducts).toHaveBeenCalled();
    Object.keys(spies).filter(key => key !== 'getProducts').forEach((key) => {
      expect(spies[key]).not.toHaveBeenCalled();
    });
    spies.getProducts.calls.reset();

    /**
     * value is 'SPECIFIC_CATEGORIES'
     */
    component.couponForm.patchValue({
      type: {
        appliesTo: 'SPECIFIC_CATEGORIES',
      },
    });

    expect(spies.getCategories).toHaveBeenCalled();
    Object.keys(spies).filter(key => key !== 'getCategories').forEach((key) => {
      expect(spies[key]).not.toHaveBeenCalled();
    });
    spies.getCategories.calls.reset();

    /**
     * value is null
     */
    component.couponForm.patchValue({
      type: {
        appliesTo: null,
      },
    });
    Object.keys(spies).forEach(key => expect(spies[key]).not.toHaveBeenCalled());


    /**
     * test customerEligibility changes
     * value is 'SPECIFIC_GROUPS_OF_CUSTOMERS'
     */
    component.couponForm.patchValue({
      customerEligibility: 'SPECIFIC_GROUPS_OF_CUSTOMERS',
    });

    expect(spies.getGroupsOfCustomers).toHaveBeenCalled();
    Object.keys(spies).filter(key => key !== 'getGroupsOfCustomers').forEach((key) => {
      expect(spies[key]).not.toHaveBeenCalled();
    });
    spies.getGroupsOfCustomers.calls.reset();

    /**
     * value is 'SPECIFIC_CUSTOMERS'
     */
    component.couponForm.patchValue({
      customerEligibility: 'SPECIFIC_CUSTOMERS',
    });

    expect(spies.getCustomers).toHaveBeenCalled();
    Object.keys(spies).filter(key => key !== 'getCustomers').forEach((key) => {
      expect(spies[key]).not.toHaveBeenCalled();
    });
    spies.getCustomers.calls.reset();

    /**
     * value is null
     */
    component.couponForm.patchValue({
      customerEligibility: null,
    });
    Object.keys(spies).forEach(key => expect(spies[key]).not.toHaveBeenCalled());

  });

  it('should setup dismiss', () => {

    const closeSpy = spyOn(component, 'onClose');

    component.setupDismiss();

    expect(closeSpy).not.toHaveBeenCalled();
    peOverlayRef.backdropClick.next();
    expect(closeSpy).toHaveBeenCalled();

  });

  it('should handle close', () => {

    const dialogRefMock = {
      afterClosed: new Subject(),
    };

    overlayService.open.and.returnValue(dialogRefMock as any);

    component.onClose();

    expect(overlayService.open).toHaveBeenCalledWith({
      height: 475,
      width: 350,
    }, PeCancelCouponConfirmationDialog);
    expect(peOverlayRef.close).not.toHaveBeenCalled();

    /**
     * afterClosed data is null
     */
    dialogRefMock.afterClosed.next(null);

    expect(peOverlayRef.close).not.toHaveBeenCalled();

    /**
     * afterClosed data is set
     */
    dialogRefMock.afterClosed.next({ test: 'data' });

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

  it('should open datepicker', () => {

    const afterClosedSubject = new Subject();
    const controlName = 'endDateDate';
    const patchSpy = spyOn(component.couponForm.get(controlName), 'patchValue').and.callThrough();

    dialogRef.afterClosed.and.returnValue(afterClosedSubject);

    component.openDatepicker(controlName);

    /**
     * afterClosed value is null
     */
    afterClosedSubject.next(null);

    expect(matDialog.open).toHaveBeenCalled();
    expect(patchSpy).not.toHaveBeenCalled();

    /**
     * afterClosed value is set
     */
    afterClosedSubject.next(new Date(2021, 5, 30));

    expect(patchSpy).toHaveBeenCalledWith('30.06.2021');
    expect(component.couponForm.get(controlName).value).toEqual('30.06.2021');

  });

  it('should handle save', () => {

    const bodyMock = {
      test: 'body',
      status: null,
      startDate: null,
      endDate: null,
    };
    let generatedBody: any;
    const getPercentageSpy = spyOn(component, 'getPercentage').and.callFake(() => {
      generatedBody = {
        ...bodyMock,
        type: PeCouponTypeEnum.Percentage,
      };
      return generatedBody;
    });
    const getFixedAmountSpy = spyOn(component, 'getFixedAmount').and.callFake(() => {
      generatedBody = {
        ...bodyMock,
        type: PeCouponTypeEnum.FixedAmount,
      };
      return generatedBody;
    });
    const getFreeShippingSpy = spyOn(component, 'getFreeShipping').and.callFake(() => {
      generatedBody = {
        ...bodyMock,
        type: PeCouponTypeEnum.FreeShipping,
      };
      return generatedBody;
    });
    const getBuyXGetYSpy = spyOn(component, 'getBuyXGetY').and.callFake(() => {
      generatedBody = {
        ...bodyMock,
        type: PeCouponTypeEnum.BuyXGetY,
      };
      return generatedBody;
    });
    const form = component.couponForm;
    const clearValidatorsSpy = spyOn(form, 'clearValidators');
    const markSpy = spyOn(component[`changeDetectorRef`], 'markForCheck');

    /**
     * component.coupon is null
     * component.couponForm.value.customerEligibility is PeCouponTypeCustomerEligibilityEnum.Everyone
     * component.couponForm.value.type.type is PeCouponTypeEnum.Percentage
     * component.couponForm.value.setEndDate is FALSE
     * component.couponForm.value.name is not set and form is invalid as it is required
     */
    component.coupon = null;
    form.patchValue({
      code: 'code',
      businessId: 'b-001',
      description: 'desc',
      name: null,
      startDateDate: '13.01.2021',
      startDateTime: '12:00',
      customerEligibility: PeCouponTypeCustomerEligibilityEnum.Everyone,
      type: {
        type: PeCouponTypeEnum.Percentage,
      },
      setEndDate: false,
    });
    component.onSave();

    expect(form.controls.code.enabled).toBe(true);
    expect(clearValidatorsSpy).toHaveBeenCalled();
    expect(getPercentageSpy).toHaveBeenCalled();
    expect(getFixedAmountSpy).not.toHaveBeenCalled();
    expect(getFreeShippingSpy).not.toHaveBeenCalled();
    expect(getBuyXGetYSpy).not.toHaveBeenCalled();
    expect(generatedBody.status).toEqual(PeCouponsStatusEnum.Active);
    expect(generatedBody.endDate).toBeNull();
    expect(generatedBody.startDate).toEqual(new Date(2021, 0, 13, 12, 0));
    expect(generatedBody.type).toEqual(PeCouponTypeEnum.Percentage);
    expect(form.controls.customerEligibilityCustomerGroups.disabled).toBe(true);
    expect(form.controls.customerEligibilitySpecificCustomers.disabled).toBe(true);
    expect(form.controls.endDateDate.disabled).toBe(true);
    expect(form.controls.endDateTime.disabled).toBe(true);
    expect(api.updateCoupon).not.toHaveBeenCalled();
    expect(api.createCoupon).not.toHaveBeenCalled();

    /**
     * component.coupon is set
     * component.couponForm.value.customerEligibility is PeCouponTypeCustomerEligibilityEnum.SpecificCustomers
     * component.couponForm.value.type.type is PeCouponTypeEnum.FixedAmount
     */
    clearValidatorsSpy.calls.reset();
    getPercentageSpy.calls.reset();
    Object.values(form.controls).forEach(control => control.enable());

    component.coupon = { _id: 'c-001' } as any;
    form.patchValue({
      customerEligibility: PeCouponTypeCustomerEligibilityEnum.SpecificCustomers,
      customerEligibilitySpecificCustomers: [{ _id: 'u-001' }],
      type: {
        type: PeCouponTypeEnum.FixedAmount,
      },
      startDateDate: moment().add(1, 'month').format('DD.MM.YYYY'),
    });
    component.onSave();

    expect(form.controls.code.disabled).toBe(true);
    expect(clearValidatorsSpy).toHaveBeenCalled();
    expect(getPercentageSpy).not.toHaveBeenCalled();
    expect(getFixedAmountSpy).toHaveBeenCalled();
    expect(getFreeShippingSpy).not.toHaveBeenCalled();
    expect(getBuyXGetYSpy).not.toHaveBeenCalled();
    expect(generatedBody.status).toEqual(PeCouponsStatusEnum.Inactive);
    expect(generatedBody.endDate).toBeNull();
    expect(generatedBody.startDate).toEqual(moment(`${form.value.startDateDate} ${form.value.startDateTime}`, 'DD.MM.YYYY hh:mm:ss').toDate());
    expect(generatedBody.type).toEqual(PeCouponTypeEnum.FixedAmount);
    expect(form.controls.customerEligibilityCustomerGroups.disabled).toBe(true);
    expect(form.controls.customerEligibilitySpecificCustomers.disabled).toBe(false);
    expect(form.controls.endDateDate.disabled).toBe(true);
    expect(form.controls.endDateTime.disabled).toBe(true);
    expect(api.updateCoupon).not.toHaveBeenCalled();
    expect(api.createCoupon).not.toHaveBeenCalled();

    /**
     * component.coupon is null
     * component.couponForm.value.setEndDate is TRUE
     * component.couponForm is valid
     * component.couponForm.value.customerEligibility is PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers
     * component.couponForm.value.type.type is PeCouponTypeEnum.FreeShipping
     * api.createCoupon throws error
     */
    clearValidatorsSpy.calls.reset();
    getFixedAmountSpy.calls.reset();
    Object.values(form.controls).forEach(control => control.enable());
    api.createCoupon.and.returnValue(throwError('test error'));

    const errorSpy = spyOn(rxjs, 'throwError').and.returnValue(EMPTY);

    component.coupon = null;
    form.patchValue({
      customerEligibility: PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers,
      customerEligibilityCustomerGroups: [{ _id: 'cg-001' }],
      type: {
        type: PeCouponTypeEnum.FreeShipping,
      },
      setEndDate: true,
      startDateDate: '13.01.2021',
      endDateDate: moment().add(1, 'month').format('DD.MM.YYYY'),
      endDateTime: '12:00',
      name: 'Coupon 1',
    });
    component.onSave();

    expect(form.controls.code.enabled).toBe(true);
    expect(clearValidatorsSpy).toHaveBeenCalled();
    expect(getPercentageSpy).not.toHaveBeenCalled();
    expect(getFixedAmountSpy).not.toHaveBeenCalled();
    expect(getFreeShippingSpy).toHaveBeenCalled();
    expect(getBuyXGetYSpy).not.toHaveBeenCalled();
    expect(generatedBody.status).toEqual(PeCouponsStatusEnum.Active);
    expect(generatedBody.endDate).toEqual(moment(`${form.value.endDateDate} ${form.value.endDateTime}`, 'DD.MM.YYYY hh:mm:ss').toDate());
    expect(generatedBody.startDate).toEqual(new Date(2021, 0, 13, 12, 0));
    expect(generatedBody.type).toEqual(PeCouponTypeEnum.FreeShipping);
    expect(form.controls.customerEligibilityCustomerGroups.disabled).toBe(false);
    expect(form.controls.customerEligibilitySpecificCustomers.disabled).toBe(true);
    expect(form.controls.endDateDate.disabled).toBe(false);
    expect(form.controls.endDateTime.disabled).toBe(false);
    expect(api.updateCoupon).not.toHaveBeenCalled();
    expect(api.createCoupon).toHaveBeenCalledWith(generatedBody);
    expect(peOverlayRef.close).not.toHaveBeenCalled();
    expect(form.controls.code.getError('isNotUnique')).toBe(true);
    expect(markSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('test error');

    /**
     * endDate is before the startDate so form is invalid
     * component.couponForm.value.type.type is PeCouponTypeEnum.BuyXGetY
     */
    clearValidatorsSpy.calls.reset();
    getFreeShippingSpy.calls.reset();
    errorSpy.calls.reset();
    api.createCoupon.calls.reset();
    markSpy.calls.reset();
    Object.values(form.controls).forEach(control => control.enable());
    form.controls.code.setErrors(null);

    component.coupon = null;
    form.patchValue({
      type: {
        type: PeCouponTypeEnum.BuyXGetY,
      },
      startDateDate: '13.01.2021',
      endDateDate: '10.01.2021',
    });
    component.onSave();

    expect(form.controls.code.enabled).toBe(true);
    expect(clearValidatorsSpy).toHaveBeenCalled();
    expect(getPercentageSpy).not.toHaveBeenCalled();
    expect(getFixedAmountSpy).not.toHaveBeenCalled();
    expect(getFreeShippingSpy).not.toHaveBeenCalled();
    expect(getBuyXGetYSpy).toHaveBeenCalled();
    expect(generatedBody.status).toEqual(PeCouponsStatusEnum.Inactive);
    expect(generatedBody.endDate).toEqual(moment(`${form.value.endDateDate} ${form.value.endDateTime}`, 'DD.MM.YYYY hh:mm:ss').toDate());
    expect(generatedBody.startDate).toEqual(new Date(2021, 0, 13, 12, 0));
    expect(generatedBody.type).toEqual(PeCouponTypeEnum.BuyXGetY);
    expect(form.controls.endDateDate.disabled).toBe(false);
    expect(form.controls.endDateTime.disabled).toBe(false);
    expect(form.controls.endDateDate.getError('isBefore')).toBe(true);
    expect(form.controls.endDateTime.getError('isBefore')).toBe(true);
    expect(api.updateCoupon).not.toHaveBeenCalled();
    expect(api.createCoupon).not.toHaveBeenCalled();
    expect(peOverlayRef.close).not.toHaveBeenCalled();
    expect(form.controls.code.errors).toBeNull();
    expect(markSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * component.couponForm is valid
     * api.createCoupon returns mocked data
     */
    api.createCoupon.and.returnValue(of(null));
    Object.values(form.controls).forEach(control => control.enable());
    form.controls.endDateDate.setErrors(null);
    form.controls.endDateTime.setErrors(null);

    component.coupon = null;
    form.patchValue({
      startDateDate: '13.01.2021',
      endDateDate: '01.06.2021',
    });
    component.onSave();

    expect(form.controls.endDateDate.errors).toBeNull();
    expect(form.controls.endDateTime.errors).toBeNull();
    expect(generatedBody.status).toEqual(PeCouponsStatusEnum.Active);
    expect(generatedBody.endDate).toEqual(new Date(2021, 5, 1, 12, 0));
    expect(generatedBody.startDate).toEqual(new Date(2021, 0, 13, 12, 0));
    expect(generatedBody.type).toEqual(PeCouponTypeEnum.BuyXGetY);
    expect(api.updateCoupon).not.toHaveBeenCalled();
    expect(api.createCoupon).toHaveBeenCalledWith(generatedBody);
    expect(peOverlayRef.close).toHaveBeenCalledWith({ new: true });
    expect(form.controls.code.errors).toBeNull();
    expect(markSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * component.coupon is set
     * api.updateCoupon returns mocked data
     */
    api.createCoupon.calls.reset();
    api.updateCoupon.and.returnValue(of(null));
    peOverlayRef.close.calls.reset();
    Object.values(form.controls).forEach(control => control.enable());

    component.coupon = { _id: 'c-001' } as any;
    component.onSave();

    expect(api.createCoupon).not.toHaveBeenCalled();
    expect(api.updateCoupon).toHaveBeenCalledWith('c-001', generatedBody);
    expect(peOverlayRef.close).toHaveBeenCalledWith({ new: false });
    expect(markSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

  });

  it('should get percentage', () => {

    const couponMock = {
      _id: 'c-001',
      code: 'code',
      businessId: 'b-001',
      description: 'd-001',
      name: 'Coupon 1',
      limits: {
        limitOneUsePerCustomer: null,
        limitUsage: null,
        limitUsageAmount: null,
      },
      channelSets: null,
      type: {
        type: PeCouponTypeEnum.Percentage,
        discountValue: 13.5,
        appliesTo: null,
        appliesToProducts: null,
        appliesToCategories: null,
        minimumRequirements: null,
        minimumRequirementsPurchaseAmount: null,
        minimumRequirementsQuantityOfItems: null,
      },
      status: null,
      customerEligibility: null,
      customerEligibilitySpecificCustomers: null,
      customerEligibilityCustomerGroups: null,
    };
    const form = component.couponForm;
    const limits = (form.get('limits') as FormGroup).controls;
    const type = (form.get('type') as FormGroup).controls;

    /**
     * couponMock.limits are all null
     * couponMock.channelSets is null
     * couponMock.type.discountValue is float
     * couponMock.type.appliesTo is null
     * couponMock.type.appliesToProducts is null
     * couponMock.type.appliesToCategories is null
     * couponMock.type.minimumRequirements is null
     */
    let body = component.getPercentage(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: false,
      limitUsage: false,
      limitUsageAmount: 0,
    });
    expect(body.channelSets).toEqual([]);
    expect(body.type.appliesToProducts).toEqual([]);
    expect(body.type.appliesToCategories).toEqual([]);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.None);
    expect(body.type.minimumRequirementsPurchaseAmount).toBeUndefined();
    expect(body.type.minimumRequirementsQuantityOfItems).toBeUndefined();
    expect(body.status).toEqual(PeCouponsStatusEnum.Inactive);
    expect(body.customerEligibilitySpecificCustomers).toEqual([]);
    expect(body.customerEligibilityCustomerGroups).toEqual([]);
    expect(limits.limitUsageAmount.disabled).toBe(true);
    expect(type.discountValue.getError('notInt')).toBe(true);
    expect(type.appliesToCategories.disabled).toBe(true);
    expect(type.appliesToProducts.disabled).toBe(true);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(true);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(true);

    /**
     * couponMock.limits are all set
     * couponMock.channelSets is set
     * couponMock.type.discountValue is integer
     * couponMock.type.appliesTo is PeCouponTypeAppliedToEnum.SpecificCategories
     * couponMock.type.appliesToProducts is set
     * couponMock.type.appliesToCategories is set
     * couponMock.type.minimumRequirements is PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount
     */
    Object.values(form.controls).forEach(control => control.enable());
    type.discountValue.setErrors(null);

    couponMock.limits = {
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13,
    };
    couponMock.channelSets = [{ _id: 'ch-001' }];
    couponMock.status = PeCouponsStatusEnum.Active;
    couponMock.type.discountValue = 5;
    couponMock.type.appliesTo = PeCouponTypeAppliedToEnum.SpecificCategories;
    couponMock.type.appliesToProducts = [{ _id: 'prod-001' }];
    couponMock.type.appliesToCategories = [{ _id: 'cat-001' }];
    couponMock.type.minimumRequirements = PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount;
    couponMock.type.minimumRequirementsPurchaseAmount = 3;
    couponMock.customerEligibilitySpecificCustomers = [{ _id: 'u-001' }];
    couponMock.customerEligibilityCustomerGroups = [{ _id: 'cg-001' }];

    body = component.getPercentage(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13,
    });
    expect(body.channelSets).toEqual(couponMock.channelSets);
    expect(body.type.appliesToProducts).toEqual(couponMock.type.appliesToProducts);
    expect(body.type.appliesToCategories).toEqual(couponMock.type.appliesToCategories);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount);
    expect(body.type.minimumRequirementsPurchaseAmount).toBe(3);
    expect(body.type.minimumRequirementsQuantityOfItems).toBeUndefined();
    expect(body.status).toEqual(PeCouponsStatusEnum.Active);
    expect(body.customerEligibilitySpecificCustomers).toEqual(couponMock.customerEligibilitySpecificCustomers);
    expect(body.customerEligibilityCustomerGroups).toEqual(couponMock.customerEligibilityCustomerGroups);
    expect(limits.limitUsageAmount.disabled).toBe(false);
    expect(limits.limitUsageAmount.getError('notInt')).toBeUndefined();
    expect(type.discountValue.getError('notInt')).toBeUndefined();
    expect(type.appliesToCategories.disabled).toBe(false);
    expect(type.appliesToProducts.disabled).toBe(true);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(false);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(true);

    /**
     * couponMock.limits.limitUsageAmount is float
     * couponMock.type.appliesTo is PeCouponTypeAppliedToEnum.SpecificProducts
     * couponMock.type.minimumRequirements is PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems
     * couponMock.type.minimumRequirementsQuantityOfItems is float
     */
    Object.values(form.controls).forEach(control => control.enable());

    couponMock.limits.limitUsageAmount = 13.5;
    couponMock.type.appliesTo = PeCouponTypeAppliedToEnum.SpecificProducts;
    couponMock.type.minimumRequirements = PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems;
    couponMock.type.minimumRequirementsQuantityOfItems = 3.5;

    body = component.getPercentage(couponMock);

    expect(body.limits.limitUsageAmount).toBe(13.5);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems);
    expect(body.type.minimumRequirementsQuantityOfItems).toBe(3.5);
    expect(limits.limitUsageAmount.disabled).toBe(false);
    expect(limits.limitUsageAmount.getError('notInt')).toBe(true);
    expect(type.appliesToCategories.disabled).toBe(true);
    expect(type.appliesToProducts.disabled).toBe(false);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(true);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(false);
    expect(type.minimumRequirementsQuantityOfItems.getError('notInt')).toBe(true);

    /**
     * couponMock.type.minimumRequirementsQuantityOfItems is integer
     */
    Object.values(form.controls).forEach(control => control.enable());
    type.minimumRequirementsQuantityOfItems.setErrors(null);

    couponMock.type.minimumRequirementsQuantityOfItems = 3;

    body = component.getPercentage(couponMock);

    expect(type.minimumRequirementsQuantityOfItems.getError('notInt')).toBeUndefined();

  });

  it('should get butX getY', () => {

    const couponMock = {
      _id: 'c-001',
      code: 'code',
      businessId: 'b-001',
      description: 'desc',
      name: 'Coupon 1',
      limits: {
        limitOneUsePerCustomer: null,
        limitUsage: null,
        limitUsageAmount: null,
      },
      channelSets: null,
      type: {
        type: PeCouponTypeEnum.BuyXGetY,
        buyRequirementType: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount,
        buyQuantity: 3,
        buyType: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories,
        buyProducts: null,
        buyCategories: null,
        getQuantity: 1,
        getType: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories,
        getProducts: null,
        getCategories: null,
        getDiscountType: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Free,
        getDiscountValue: 100,
        maxUsesPerOrder: null,
        maxUsesPerOrderValue: 100,
      },
      status: null,
      customerEligibility: PeCouponTypeCustomerEligibilityEnum.Everyone,
      customerEligibilitySpecificCustomers: null,
      customerEligibilityCustomerGroups: null,
    };
    const form = component.couponForm;
    const limits = (form.get('limits') as FormGroup).controls;
    const type = (form.get('type') as FormGroup).controls;

    /**
     * couponMock.limits are all null
     * couponMock.channelSets is null
     * couponMock.type.buyType is PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories
     * couponMock.type.getType is PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories
     * couponMock.type.buyRequirementType is PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount
     */
    let body = component.getBuyXGetY(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: false,
      limitUsage: false,
      limitUsageAmount: 0,
    });
    expect(body.channelSets).toEqual([]);
    expect(body.type.buyProducts).toEqual([]);
    expect(body.type.buyCategories).toEqual([]);
    expect(body.type.getProducts).toEqual([]);
    expect(body.type.getCategories).toEqual([]);
    expect(body.type.maxUsesPerOrder).toBe(false);
    expect(body.status).toEqual(PeCouponsStatusEnum.Inactive);
    expect(body.customerEligibilitySpecificCustomers).toEqual([]);
    expect(body.customerEligibilityCustomerGroups).toEqual([]);
    expect(limits.limitUsageAmount.disabled).toBe(true);
    expect(type.buyProducts.disabled).toBe(true);
    expect(type.buyCategories.disabled).toBe(false);
    expect(type.getProducts.disabled).toBe(true);
    expect(type.getCategories.disabled).toBe(false);
    expect(type.getDiscountValue.disabled).toBe(true);
    expect(type.maxUsesPerOrderValue.disabled).toBe(true);
    expect(type.getQuantity.getError('notInt')).toBeUndefined();

    /**
     * couponMock.limits are all set
     * couponMock.limits.limitUsageAmount is float
     * couponMock.channelSets is set
     * couponMock.type.buyType is PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts
     * couponMock.type.getType is PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts
     * couponMock.type.buyRequirementType is PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems
     * couponMock.type.maxUsesPerOrderValue is float
     * couponMock.type.maxUsesPerOrder is TRUE
     * couponMock.type.getQuantity is float
     * couponMock.type.buyQuantity is float
     * couponMock.type.buyProducts is set
     * couponMock.type.getProducts is set
     * couponMock.type.buyCategories is set
     * couponMock.type.getCategories is set
     * couponMock.type.getDiscountType is PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage
     * couponMock.customerEligibilitySpecificCustomers is set
     * couponMock.customerEligibilityCustomerGroups is set
     * couponMock.status is set
     */
    Object.values(form.controls).forEach(control => control.enable());

    couponMock.limits = {
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13.5,
    };
    couponMock.channelSets = [{ _id: 'ch-001' }];
    couponMock.type.buyType = PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts;
    couponMock.type.getType = PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts;
    couponMock.type.buyRequirementType = PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems;
    couponMock.type.maxUsesPerOrder = true;
    couponMock.type.maxUsesPerOrderValue = 3.5;
    couponMock.type.buyQuantity = 5.5;
    couponMock.type.getQuantity = 5.5;
    couponMock.type.buyProducts = [{ _id: 'prod-001' }];
    couponMock.type.getProducts = [{ _id: 'prod-002' }];
    couponMock.type.buyCategories = [{ _id: 'cat-001' }];
    couponMock.type.getCategories = [{ _id: 'cat-002' }];
    couponMock.type.getDiscountType = PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage;
    couponMock.customerEligibilitySpecificCustomers = [{ _id: 'u-001' }];
    couponMock.customerEligibilityCustomerGroups = [{ _id: 'cg-001' }];
    couponMock.status = PeCouponsStatusEnum.Active;

    body = component.getBuyXGetY(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13.5,
    });
    expect(body.channelSets).toEqual(couponMock.channelSets);
    expect(body.type.buyProducts).toEqual(couponMock.type.buyProducts);
    expect(body.type.buyCategories).toEqual(couponMock.type.buyCategories);
    expect(body.type.getProducts).toEqual(couponMock.type.getProducts);
    expect(body.type.getCategories).toEqual(couponMock.type.getCategories);
    expect(body.type.maxUsesPerOrder).toBe(true);
    expect(body.status).toEqual(PeCouponsStatusEnum.Active);
    expect(body.customerEligibilitySpecificCustomers).toEqual(couponMock.customerEligibilitySpecificCustomers);
    expect(body.customerEligibilityCustomerGroups).toEqual(couponMock.customerEligibilityCustomerGroups);
    expect(limits.limitUsageAmount.disabled).toBe(false);
    expect(limits.limitUsageAmount.getError('notInt')).toBe(true);
    expect(type.buyProducts.disabled).toBe(false);
    expect(type.buyCategories.disabled).toBe(true);
    expect(type.getProducts.disabled).toBe(false);
    expect(type.getCategories.disabled).toBe(true);
    expect(type.getDiscountValue.disabled).toBe(false);
    expect(type.maxUsesPerOrderValue.disabled).toBe(false);
    expect(type.maxUsesPerOrderValue.getError('notInt')).toBe(true);
    expect(type.getQuantity.getError('notInt')).toBe(true);
    expect(type.buyQuantity.getError('notInt')).toBe(true);

    /**
     * couponMock.limits.limitUsageAmount is integer
     * couponMock.type.maxUsesPerOrderValue is integer
     * couponMock.type.buyQuantity is integer
     * couponMock.type.getQuantity is integer
     */
    Object.values(form.controls).forEach(control => control.enable());

    couponMock.limits.limitUsageAmount = 13;
    couponMock.type.maxUsesPerOrderValue = 5;
    couponMock.type.buyQuantity = 3;
    couponMock.type.getQuantity = 1;

    body = component.getBuyXGetY(couponMock);

    expect(limits.limitUsageAmount.getError('notInt')).toBeUndefined();
    expect(type.maxUsesPerOrderValue.getError('notInt')).toBeUndefined();
    expect(type.getQuantity.getError('notInt')).toBeUndefined();
    expect(type.buyQuantity.getError('notInt')).toBeUndefined();

  });

  it('should get fixed amount', () => {

    const couponMock = {
      _id: 'c-001',
      code: 'code',
      businessId: 'b-001',
      description: 'd-001',
      name: 'Coupon 1',
      limits: {
        limitOneUsePerCustomer: null,
        limitUsage: null,
        limitUsageAmount: null,
      },
      channelSets: null,
      type: {
        type: PeCouponTypeEnum.FixedAmount,
        discountValue: 13.5,
        appliesTo: null,
        appliesToProducts: null,
        appliesToCategories: null,
        minimumRequirements: null,
        minimumRequirementsPurchaseAmount: null,
        minimumRequirementsQuantityOfItems: null,
      },
      status: null,
      customerEligibility: null,
      customerEligibilitySpecificCustomers: null,
      customerEligibilityCustomerGroups: null,
    };
    const form = component.couponForm;
    const limits = (form.get('limits') as FormGroup).controls;
    const type = (form.get('type') as FormGroup).controls;

    /**
     * couponMock.limits are all null
     * couponMock.channelSets is null
     * couponMock.type.discountValue is float
     * couponMock.type.appliesTo is null
     * couponMock.type.appliesToProducts is null
     * couponMock.type.appliesToCategories is null
     * couponMock.type.minimumRequirements is null
     * couponMock.customerEligibility is null
     */
    let body = component.getFixedAmount(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: false,
      limitUsage: false,
      limitUsageAmount: 0,
    });
    expect(body.channelSets).toEqual([]);
    expect(body.type.appliesToProducts).toEqual([]);
    expect(body.type.appliesToCategories).toEqual([]);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.None);
    expect(body.type.minimumRequirementsPurchaseAmount).toBeUndefined();
    expect(body.type.minimumRequirementsQuantityOfItems).toBeUndefined();
    expect(body.status).toEqual(PeCouponsStatusEnum.Inactive);
    expect(body.customerEligibility).toBeNull();
    expect(body.customerEligibilitySpecificCustomers).toEqual([]);
    expect(body.customerEligibilityCustomerGroups).toEqual([]);
    expect(limits.limitUsageAmount.disabled).toBe(true);
    expect(type.appliesToCategories.disabled).toBe(true);
    expect(type.appliesToProducts.disabled).toBe(true);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(true);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(true);

    /**
     * couponMock.limits are all set
     * couponMock.channelSets is set
     * couponMock.type.discountValue is integer
     * couponMock.type.appliesTo is PeCouponTypeAppliedToEnum.SpecificCategories
     * couponMock.type.appliesToProducts is set
     * couponMock.type.appliesToCategories is set
     * couponMock.type.minimumRequirements is PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount
     * couponMock.customerEligibility is PeCouponTypeCustomerEligibilityEnum.SpecificCustomers
     */
    Object.values(form.controls).forEach(control => control.enable());
    type.discountValue.setErrors(null);

    couponMock.limits = {
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13,
    };
    couponMock.channelSets = [{ _id: 'ch-001' }];
    couponMock.status = PeCouponsStatusEnum.Active;
    couponMock.type.discountValue = 5;
    couponMock.type.appliesTo = PeCouponTypeAppliedToEnum.SpecificCategories;
    couponMock.type.appliesToProducts = [{ _id: 'prod-001' }];
    couponMock.type.appliesToCategories = [{ _id: 'cat-001' }];
    couponMock.type.minimumRequirements = PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount;
    couponMock.type.minimumRequirementsPurchaseAmount = 3;
    couponMock.customerEligibility = PeCouponTypeCustomerEligibilityEnum.SpecificCustomers;
    couponMock.customerEligibilitySpecificCustomers = [{ _id: 'u-001' }];
    couponMock.customerEligibilityCustomerGroups = [{ _id: 'cg-001' }];

    body = component.getFixedAmount(couponMock);

    expect(body.limits).toEqual({
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 13,
    });
    expect(body.channelSets).toEqual(couponMock.channelSets);
    expect(body.type.appliesToProducts).toEqual(couponMock.type.appliesToProducts);
    expect(body.type.appliesToCategories).toEqual(couponMock.type.appliesToCategories);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount);
    expect(body.type.minimumRequirementsPurchaseAmount).toBe(3);
    expect(body.type.minimumRequirementsQuantityOfItems).toBeUndefined();
    expect(body.status).toEqual(PeCouponsStatusEnum.Active);
    expect(body.customerEligibility).toEqual(couponMock.customerEligibility);
    expect(body.customerEligibilitySpecificCustomers).toEqual(couponMock.customerEligibilitySpecificCustomers);
    expect(body.customerEligibilityCustomerGroups).toEqual(couponMock.customerEligibilityCustomerGroups);
    expect(limits.limitUsageAmount.disabled).toBe(false);
    expect(limits.limitUsageAmount.getError('notInt')).toBeUndefined();
    expect(type.discountValue.getError('notInt')).toBeUndefined();
    expect(type.appliesToCategories.disabled).toBe(false);
    expect(type.appliesToProducts.disabled).toBe(true);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(false);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(true);

    /**
     * couponMock.limits.limitUsageAmount is float
     * couponMock.type.appliesTo is PeCouponTypeAppliedToEnum.SpecificProducts
     * couponMock.type.minimumRequirements is PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems
     * couponMock.type.minimumRequirementsQuantityOfItems is float
     */
    Object.values(form.controls).forEach(control => control.enable());

    couponMock.limits.limitUsageAmount = 13.5;
    couponMock.type.appliesTo = PeCouponTypeAppliedToEnum.SpecificProducts;
    couponMock.type.minimumRequirements = PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems;
    couponMock.type.minimumRequirementsQuantityOfItems = 3.5;

    body = component.getFixedAmount(couponMock);

    expect(body.limits.limitUsageAmount).toBe(13.5);
    expect(body.type.minimumRequirements).toEqual(PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems);
    expect(body.type.minimumRequirementsQuantityOfItems).toBe(3.5);
    expect(limits.limitUsageAmount.disabled).toBe(false);
    expect(limits.limitUsageAmount.getError('notInt')).toBe(true);
    expect(type.appliesToCategories.disabled).toBe(true);
    expect(type.appliesToProducts.disabled).toBe(false);
    expect(type.minimumRequirementsPurchaseAmount.disabled).toBe(true);
    expect(type.minimumRequirementsQuantityOfItems.disabled).toBe(false);
    expect(type.minimumRequirementsQuantityOfItems.getError('notInt')).toBe(true);

    /**
     * couponMock.type.minimumRequirementsQuantityOfItems is integer
     */
    Object.values(form.controls).forEach(control => control.enable());
    type.minimumRequirementsQuantityOfItems.setErrors(null);

    couponMock.type.minimumRequirementsQuantityOfItems = 3;

    body = component.getFixedAmount(couponMock);

    expect(type.minimumRequirementsQuantityOfItems.getError('notInt')).toBeUndefined();

  });

  it('should get products', () => {

    const products = [
      { _id: 'prod-001' },
      { _id: 'prod-002' },
    ];

    api.getProducts.and.returnValue(of({
      data: {
        getProducts: { products },
      },
    }));

    component.products = null;
    component[`getProducts`]();

    expect(api.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(products as any);

  });

  it('should get groups of customers', () => {

    const contactsGroups = [
      { id: 'cg-001', name: 'Contact Group 1', businessId: 'b-001' },
      { id: 'cg-002', name: 'Contact Group 2', businessId: 'b-001' },
    ];

    api.getContactGroups.and.returnValue(of({
      data: {
        groups: { nodes: contactsGroups },
      },
    }));

    component.groupsOfCustomersSource = null;
    component.groupsOfCustomers = null;
    component[`getGroupsOfCustomers`]();

    expect(api.getContactGroups).toHaveBeenCalled();
    expect(component.groupsOfCustomersSource).toEqual(contactsGroups as any);
    expect(component.groupsOfCustomers).toEqual(contactsGroups.map(cg => ({
      id: cg.id,
      title: cg.name,
    })) as any);

  });

  it('should get customers', () => {

    const contacts = [
      {
        id: 'c-001',
        email: 'email@test.com',
        phone: '+123456789',
        contactFields: {
          nodes: [{
            field: {
              name: 'field.name',
            },
            value: 'field.value',
          }],
        },
      },
      {
        id: 'c-002',
        email: null,
        phone: '+123456789',
        contactFields: { nodes: [] },
      },
    ];

    api.getContacts.and.returnValue(of({
      data: {
        contacts: { nodes: contacts },
      },
    }));

    component.customers = null;
    component[`getCustomers`]();

    expect(api.getContacts).toHaveBeenCalled();
    expect(component.customersSource).toEqual(contacts as any);
    expect(component.customers).toEqual([
      {
        id: 'c-001',
        title: 'email@test.com',
        email: 'email@test.com',
        phone: '+123456789',
        'field.name': 'field.value',
      },
      {
        id: 'c-002',
        title: '+123456789',
        email: null,
        phone: '+123456789',
      },
    ] as any);

  });

  it('should get categories', () => {

    const categories = [
      { _id: 'cat-001' },
      { _id: 'cat-002' },
    ];

    api.getCategories.and.returnValue(of({
      data: {
        getCategories: categories,
      },
    }));

    component.categories = null;
    component[`getCategories`]();

    expect(api.getCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(categories as any);

  });

});
