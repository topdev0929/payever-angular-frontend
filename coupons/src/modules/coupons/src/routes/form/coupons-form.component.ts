import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { PeDateTimePickerService } from '@pe/ui';
import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

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
import { PeCouponCategory } from '../../misc/interfaces/coupon-category.interface';
import { PeCouponCustomer } from '../../misc/interfaces/coupon-customer.interface';
import { PeCouponCustomerGroup } from '../../misc/interfaces/coupon-customer-group.interface';
import { PeCouponCountry } from '../../misc/interfaces/coupon-country.interface';
import { PeCouponOption } from '../../misc/interfaces/coupon-option.interface';
import { PeCouponProduct } from '../../misc/interfaces/coupon-product.interface';
import { PeCouponsApi } from '../../services/abstract.coupons.api';
import { PeCouponsOverlayService, PeOverlayRef, PE_OVERLAY_DATA } from '../../misc/services/coupons-overlay/coupons-overlay.service';
import { PeCouponsDatepickerComponent } from '../../misc/components/coupons-datepicker/coupons-datepicker.component';
import { PeCancelCouponConfirmationDialog } from '../dialogs/cancel-coupon-confirmation-dialog/cancel-coupon-confirmation-dialog';

import * as moment_ from 'moment';
import { merge } from 'lodash';

import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { DestroyService } from '../../misc/services/destroy.service';

const moment = moment_;

@Component({
  selector: 'pe-coupons-form',
  templateUrl: './coupons-form.component.html',
  styleUrls: ['./coupons-form.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCouponsFormComponent implements OnInit {

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  coupon: PeCoupon;

  edit = false;

  customersSource: PeCouponCustomer[];
  groupsOfCustomersSource: PeCouponCustomerGroup[];

  categories: PeCouponCategory[] = [];
  countries: PeCouponCountry[] = [];
  customers: PeCouponOption[] = [];
  groupsOfCustomers: PeCouponOption[] = [];
  products: PeCouponProduct[] = [];

  types = [
    { label: 'Percentage', value: PeCouponTypeEnum.Percentage },
    { label: 'Fixed amount', value: PeCouponTypeEnum.FixedAmount },
    { label: 'Free shipping', value: PeCouponTypeEnum.FreeShipping },
    { label: 'Buy X get Y', value: PeCouponTypeEnum.BuyXGetY },
  ];

  appliesTo = [
    { label: 'All products', value: PeCouponTypeAppliedToEnum.AllPpoducts },
    { label: 'Specific categories', value: PeCouponTypeAppliedToEnum.SpecificCategories },
    { label: 'Specific products', value: PeCouponTypeAppliedToEnum.SpecificProducts },
  ];

  minimumRequirements = [
    { label: 'None', value: PeCouponTypeMinimumRequirementsEnum.None },
    { label: 'Minimum purchase amount ($)', value: PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount },
    { label: 'Minimum quantity of items', value: PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems },
  ];

  customerEligibility = [
    { label: 'Everyone', value: PeCouponTypeCustomerEligibilityEnum.Everyone },
    { label: 'Specific groups of customers', value: PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers },
    { label: 'Specific customers', value: PeCouponTypeCustomerEligibilityEnum.SpecificCustomers },
  ];

  freeShippingType = [
    { label: 'All countries', value: PeCouponTypeFreeShippingTypeEnum.AllCountries },
    { label: 'Selected countries', value: PeCouponTypeFreeShippingTypeEnum.SelectedCountries },
  ];

  buyRequirementType = [
    { label: 'Minimum quantity of items', value: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems },
    { label: 'Minimum purchase amount', value: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount },
  ];

  buyOrGetType = [
    { label: 'Specific categories', value: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories },
    { label: 'Specific products', value: PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts },
  ];

  atADiscountedValue = [
    { label: 'Percentage', value: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage },
    { label: 'Free', value: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Free },
  ];

  couponForm: FormGroup = this.formBuilder.group({
    businessId: [this.envService.businessId],
    code: [],
    customerEligibility: [PeCouponTypeCustomerEligibilityEnum.Everyone],
    customerEligibilityCustomerGroups: [[]],
    customerEligibilitySpecificCustomers: [[]],
    description: [],
    endDate: [],
    endDateDate: [],
    endDateTime: [],
    setEndDate: [false],
    startDate: [],
    startDateDate: [],
    startDateTime: [],
    limits: this.formBuilder.group({
      limitOneUsePerCustomer: [false],
      limitUsage: [false],
      limitUsageAmount: [],
    }),
    name: ['name'], // ???
    type: this.formBuilder.group({
      appliesTo: [PeCouponTypeAppliedToEnum.AllPpoducts],
      appliesToProducts: [[]],
      appliesToCategories: [[]],
      buyRequirementType: [PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems],
      buyQuantity: [],
      buyType: [PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories],
      buyProducts: [[]],
      buyCategories: [[]],
      discountValue: [null],
      freeShippingType: [PeCouponTypeFreeShippingTypeEnum.AllCountries],
      freeShippingToCountries: [[]],
      getType: [PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories],
      getQuantity: [],
      getProducts: [[]],
      getCategories: [[]],
      getDiscountType: [PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage],
      getDiscountValue: [],
      maxUsesPerOrder: [false],
      maxUsesPerOrderValue: [],
      minimumRequirements: [PeCouponTypeMinimumRequirementsEnum.None],
      minimumRequirementsPurchaseAmount: [],
      minimumRequirementsQuantityOfItems: [],
      type: [PeCouponTypeEnum.Percentage],
    }),
  });

  timMask = [/\d/, /\d/, ':', /\d/, /\d/];
  datMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    private peOverlayRef: PeOverlayRef,
    private envService: EnvService,
    private overlayService: PeCouponsOverlayService,
    private apiService: PeCouponsApi,
    private peDateTimePickerService:PeDateTimePickerService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private readonly destroy$: DestroyService,
  ) {
    iconRegistry.addSvgIcon('point-of-sale', this.sanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-pos.svg`));
  }

  ngOnInit() {
    const couponId = this.overlayData.id;

    this.customersSource = this.overlayData.customersSource;
    this.countries = this.overlayData.countries;

    if (couponId) this.getCoupon(couponId);

    this.setupInputChanges();
    this.setupDismiss();

    merge(
      this.couponForm.get('type').get('freeShippingType').valueChanges.pipe(
        tap((value: PeCouponTypeFreeShippingTypeEnum) => {
          if (value === PeCouponTypeFreeShippingTypeEnum.AllCountries) {
            this.couponForm.get('type').get('freeShippingToCountries').setValue([]);
          }
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

  }

  addToArray(element: any, array: any, arrayName?: string): void {
    const elementId = element?.id ?? element?._id;

    if (arrayName === 'groupsOfCustomers') {
      element = this.groupsOfCustomersSource.find(el => el.id === element.id);
    }

    if (arrayName === 'customers') {
      element = this.customersSource.find(el => el.id === element.id);
    }

    if (!array.some(element => element?.id === elementId || element?._id === elementId)) {
      array.push(arrayName === 'countries' ? { _id: element._id } : element);
    }
  }

  getFromArray(array: Array<{  _id?: string; id?: string; [key: string]: any }>, id: string) {
    return array.find(element => element.id === id || element._id === id);
  }

  removeFromArray(
    array: PeCouponCustomer[] | PeCouponCustomerGroup[] | PeCouponCategory[] | PeCouponCountry[] | PeCouponProduct[],
    index: number,
  ): void {
    array.splice(index, 1);
  }

  getCoupon(couponId: string) {
    this.apiService.getCouponById(couponId).pipe(
      tap((coupon) => {
        this.edit = true;

        if (coupon.customerEligibilityCustomerGroups) {
          coupon.customerEligibilityCustomerGroups.forEach((customerGroup, i) => {
            coupon.customerEligibilityCustomerGroups[i] = this.groupsOfCustomersSource?.find(
              group => group.id === customerGroup,
            );
          });
        }

        if (coupon.customerEligibilitySpecificCustomers && this.customersSource) {
          coupon.customerEligibilitySpecificCustomers.forEach((customer, i) => {
            coupon.customerEligibilitySpecificCustomers[i] = this.customersSource.find(
              contact => contact.id === customer);
          });
        }

        if (coupon.type.appliesToProducts) {
          coupon.type.appliesToProducts.forEach((appliesToProduct, i) => {
            coupon.type.appliesToProducts[i] = this.products?.find(product => product._id === appliesToProduct);
          });
        }

        if (coupon.type.buyProducts) {
          coupon.type.buyProducts.forEach((buyProduct, i) => {
            coupon.type.buyProducts[i] = this.products?.find(product => product._id === buyProduct);
          });
        }

        if (coupon.type.buyCategories) {
          coupon.type.buyCategories.forEach((buyCategory, i) => {
            coupon.type.buyCategories[i] = this.categories?.find(category => category._id === buyCategory);
          });
        }

        if (coupon.type.appliesToCategories) {
          coupon.type.appliesToCategories.forEach((appliesToCategory, i) => {
            coupon.type.appliesToCategories[i] = this.categories?.find(category => category._id === appliesToCategory);
          });
        }

        if (coupon.type.freeShippingToCountries) {
          coupon.type.freeShippingToCountries.forEach((toCountry, i) => {
            const country = this.countries.find(countryShipping => countryShipping._id === toCountry);

            coupon.type.freeShippingToCountries[i] = { _id: country._id };
          });
        }

        if (coupon.type.getProducts) {
          coupon.type.getProducts.forEach((getProduct, i) => {
            coupon.type.getProducts[i] = this.products?.find(product => product._id === getProduct);
          });
        }

        if (coupon.type.getCategories) {
          coupon.type.getCategories.forEach((getCategory, i) => {
            coupon.type.getCategories[i] = this.categories?.find(category => category._id === getCategory);
          });
        }

        this.coupon = coupon;
        this.couponForm.patchValue(coupon);
        this.couponForm.controls.code.disable();

        if (coupon.startDate) {
          this.couponForm.get('startDateDate').patchValue(moment(coupon.startDate).format('DD.MM.YYYY'));
          this.couponForm.get('startDateTime').patchValue(moment(coupon.startDate).format('hh:mm'));
        }

        if (coupon.endDate) {
          this.couponForm.get('setEndDate').patchValue(coupon.endDate ? true : false);

          this.couponForm.get('endDateDate').patchValue(moment(coupon.endDate).format('DD.MM.YYYY'));
          this.couponForm.get('endDateTime').patchValue(moment(coupon.endDate).format('hh:mm'));
        }

        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  trackItem(index: number, item: any) {
    return item.id || item._id;
  }

  generateCode(): void {
    const codeLength = 12;

    let result = '';

    for (let i = 0; i < codeLength; i++) {
      result += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }

    this.couponForm.get('code').patchValue(result.toUpperCase());
  }

  setupInputChanges() {
    this.couponForm.get('type').get('appliesTo').valueChanges.pipe(
      map((value) => {
        if (value === 'SPECIFIC_PRODUCTS') {
          this.getProducts();
        } else if (value === 'SPECIFIC_CATEGORIES') {
          this.getCategories();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.couponForm.get('customerEligibility').valueChanges.pipe(
      map((value) => {
        if (value === 'SPECIFIC_GROUPS_OF_CUSTOMERS') {
          this.getGroupsOfCustomers();
        }else if (value === 'SPECIFIC_CUSTOMERS') {
          this.getCustomers();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  setupDismiss() {
    this.peOverlayRef.backdropClick.pipe(
      tap(() => this.onClose()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onClose(): void {
    const dialogRef = this.overlayService.open(
      { height: 475 as any, width: 350 },
      PeCancelCouponConfirmationDialog,
    );
    dialogRef.afterClosed.pipe(
      tap((data) => {
        if (data) this.peOverlayRef.close();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openDatepicker(controlName: string): void {
    this.matDialog.open(PeCouponsDatepickerComponent).afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        tap((value) => {
          if (value) {
            const date = moment(value).format('DD.MM.YYYY');
            this.couponForm.get(controlName).patchValue(date);
          }
        }),
      ).subscribe();
  }

  onSave() {
    const couponId = this.coupon?._id;

    const controls = this.couponForm.controls;

    controls.code.enable();

    this.couponForm.clearValidators();

    controls.code.setValidators([Validators.required]);
    controls.code.updateValueAndValidity();
    controls.businessId.setValidators([Validators.required]);
    controls.businessId.updateValueAndValidity();
    controls.description.setValidators([Validators.required]);
    controls.description.updateValueAndValidity();
    controls.name.setValidators([Validators.required]);
    controls.name.updateValueAndValidity();
    controls.startDateDate.setValidators([Validators.required]);
    controls.startDateDate.updateValueAndValidity();
    controls.startDateTime.setValidators([Validators.required]);
    controls.startDateTime.updateValueAndValidity();

    const value = this.couponForm.value;

    if (value.customerEligibility === PeCouponTypeCustomerEligibilityEnum.SpecificCustomers) {
      controls.customerEligibilitySpecificCustomers.setValidators([Validators.required]);
      controls.customerEligibilitySpecificCustomers.updateValueAndValidity();
    }

    if (value.customerEligibility === PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers) {
      controls.customerEligibilityCustomerGroups.setValidators([Validators.required]);
      controls.customerEligibilityCustomerGroups.updateValueAndValidity();
    }

    if (!(value.customerEligibility === PeCouponTypeCustomerEligibilityEnum.SpecificCustomers)) {
      controls.customerEligibilitySpecificCustomers.disable();
      controls.customerEligibilitySpecificCustomers.updateValueAndValidity();
    }

    if (!(value.customerEligibility === PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers)) {
      controls.customerEligibilityCustomerGroups.disable();
      controls.customerEligibilityCustomerGroups.updateValueAndValidity();
    }

    let body: PeCoupon;

    if (this.couponForm.value.type.type === PeCouponTypeEnum.Percentage) body = this.getPercentage(value);
    if (this.couponForm.value.type.type === PeCouponTypeEnum.FixedAmount) body = this.getFixedAmount(value);
    if (this.couponForm.value.type.type === PeCouponTypeEnum.FreeShipping) body = this.getFreeShipping(value);
    if (this.couponForm.value.type.type === PeCouponTypeEnum.BuyXGetY) body = this.getBuyXGetY(value);

    body.startDate = moment(`${value.startDateDate} ${value.startDateTime}`, 'DD.MM.YYYY hh:mm:ss').toDate();

    if (value.setEndDate) {
      controls.endDateDate.enable();
      controls.endDateDate.setValidators([Validators.required]);
      controls.endDateDate.updateValueAndValidity();
      controls.endDateTime.enable();
      controls.endDateTime.setValidators([Validators.required]);
      controls.endDateTime.updateValueAndValidity();
      console.log('setValidators');

      body.endDate = moment(`${value.endDateDate} ${value.endDateTime}`, 'DD.MM.YYYY hh:mm:ss').toDate();

      if (!moment(body.startDate).isBefore(body.endDate)) {
        controls.endDateDate.setErrors({ isBefore: true });
        controls.endDateTime.setErrors({ isBefore: true });
      }

      const status = moment(moment()).isBetween(body.startDate, body.endDate, 'minute');

      body.status = status ? PeCouponsStatusEnum.Active : PeCouponsStatusEnum.Inactive;
    } else {
      const status = moment(moment()).isAfter(body.startDate, 'minute');

      body.status = status ? PeCouponsStatusEnum.Active : PeCouponsStatusEnum.Inactive;
    }

    if (!value.setEndDate) {
      controls.endDateDate.disable();
      controls.endDateDate.updateValueAndValidity();
      controls.endDateTime.disable();
      controls.endDateDate.updateValueAndValidity();
    }

    if (this.couponForm.valid) {
      if (couponId) {
        this.apiService.updateCoupon(couponId, body).pipe(
          tap(() => this.peOverlayRef.close({ new: false })),
          takeUntil(this.destroy$),
        ).subscribe();
      } else {
        this.apiService.createCoupon(body).pipe(
          tap(() => this.peOverlayRef.close({ new: true })),
          catchError((response) => {
            controls.code.setErrors({ isNotUnique: true });
            this.changeDetectorRef.markForCheck();
            return throwError(response);
          }),
          takeUntil(this.destroy$),
        ).subscribe();
      }
    } else {
      if (this.coupon) controls.code.disable();
    }
  }

  getPercentage(value: PeCoupon): PeCoupon {
    const body: PeCoupon = {
      code: value.code,
      businessId: value.businessId,
      description: value.description,
      name: value.name,
      limits: {
        limitOneUsePerCustomer: value.limits.limitOneUsePerCustomer ?? false,
        limitUsage: value.limits.limitUsage ?? false,
        limitUsageAmount: Number(value.limits.limitUsageAmount) ?? null,
      },
      channelSets: value.channelSets ?? [],
      type: {
        type: value.type.type,
        discountValue: Number(value.type.discountValue),
        appliesTo: value.type.appliesTo,
        appliesToProducts: value.type.appliesToProducts ?? [],
        appliesToCategories: value.type.appliesToCategories ?? [],
        minimumRequirements: value.type.minimumRequirements ?? PeCouponTypeMinimumRequirementsEnum.None,
      },
      status: value.status ?? PeCouponsStatusEnum.Inactive,
      customerEligibility: value.customerEligibility,
      customerEligibilitySpecificCustomers: value.customerEligibilitySpecificCustomers ?? [],
      customerEligibilityCustomerGroups: value.customerEligibilityCustomerGroups ?? [],
    };


    const limits = (this.couponForm.get('limits') as FormGroup).controls;
    const type = (this.couponForm.get('type') as FormGroup).controls;

    if (value.limits.limitUsage) {
      limits.limitUsageAmount.setValidators([Validators.required]);
      limits.limitUsageAmount.updateValueAndValidity();

      if (!Number.isInteger(Number(value.limits.limitUsageAmount))) {
        limits.limitUsageAmount.setErrors({ notInt: true });
      }
    }

    if(!value.limits.limitUsage) {
      limits.limitUsageAmount.disable();
      limits.limitUsageAmount.updateValueAndValidity();
    }

    type.discountValue.setValidators([Validators.required]);
    type.discountValue.updateValueAndValidity();

    if (!Number.isInteger(Number(value.type.discountValue))) {
      type.discountValue.setErrors({ notInt: true });
    }

    if (value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificCategories) {
      type.appliesToCategories.setValidators([Validators.required]);
      type.appliesToCategories.updateValueAndValidity();
    }

    if (value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificProducts) {
      type.appliesToProducts.setValidators([Validators.required]);
      type.appliesToProducts.updateValueAndValidity();
    }

    if (!(value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificCategories)) {
      type.appliesToCategories.disable();
      type.appliesToCategories.updateValueAndValidity();
    }

    if (!(value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificProducts)) {
      type.appliesToProducts.disable();
      type.appliesToProducts.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount) {
      body.type.minimumRequirementsPurchaseAmount = Number(value.type.minimumRequirementsPurchaseAmount);

      type.minimumRequirementsPurchaseAmount.setValidators([Validators.required]);
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems) {
      const quantity = Number(value.type.minimumRequirementsQuantityOfItems);

      body.type.minimumRequirementsQuantityOfItems = quantity;

      type.minimumRequirementsQuantityOfItems.setValidators([Validators.required]);
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();

      if (!Number.isInteger(quantity)) {
        type.minimumRequirementsQuantityOfItems.setErrors({ notInt: true });
      }
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount)) {
      type.minimumRequirementsPurchaseAmount.disable();
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems)) {
      type.minimumRequirementsQuantityOfItems.disable();
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();
    }

    return body;
  }

  getBuyXGetY(value: PeCoupon): PeCoupon {
    const limits = (this.couponForm.get('limits') as FormGroup).controls;
    const type = (this.couponForm.get('type') as FormGroup).controls;

    if (value.limits.limitUsage) {
      limits.limitUsageAmount.setValidators([Validators.required]);
      limits.limitUsageAmount.updateValueAndValidity();

      if (!Number.isInteger(Number(value.limits.limitUsageAmount))) {
        limits.limitUsageAmount.setErrors({ notInt: true });
      }
    }

    if (!value.limits.limitUsage) {
      limits.limitUsageAmount.disable();
      limits.limitUsageAmount.updateValueAndValidity();
    }

    type.buyQuantity.setValidators([Validators.required]);
    type.buyQuantity.updateValueAndValidity();

    if (value.type.buyRequirementType === PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems) {
      const quantity = Number(value.type.buyQuantity);

      if (!Number.isInteger(quantity)) {
        type.buyQuantity.setErrors({ notInt: true });
      }
    }

    if (value.type.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts) {
      type.buyProducts.setValidators([Validators.required]);
      type.buyProducts.updateValueAndValidity();
    }

    if (value.type.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories) {
      type.buyCategories.setValidators([Validators.required]);
      type.buyCategories.updateValueAndValidity();
    }

    if (!(value.type.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts)) {
      type.buyProducts.disable();
      type.buyProducts.updateValueAndValidity();
    }

    if (!(value.type.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories)) {
      type.buyCategories.disable();
      type.buyCategories.updateValueAndValidity();
    }

    type.getQuantity.setValidators([Validators.required]);
    type.getQuantity.updateValueAndValidity();

    if (!Number.isInteger(Number(value.type.getQuantity))) {
      type.getQuantity.setErrors({ notInt: true });
    }

    if (value.type.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts) {
      type.getProducts.setValidators([Validators.required]);
      type.getProducts.updateValueAndValidity();
    }

    if (value.type.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories) {
      type.getCategories.setValidators([Validators.required]);
      type.getCategories.updateValueAndValidity();
    }

    if (!(value.type.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts)) {
      type.getProducts.disable();
      type.getProducts.updateValueAndValidity();
    }

    if (!(value.type.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories)) {
      type.getCategories.disable();
      type.getCategories.updateValueAndValidity();
    }

    if (value.type.getDiscountType === PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage) {
      type.getDiscountValue.setValidators([Validators.required]);
      type.getDiscountValue.updateValueAndValidity();
    }

    if (!(value.type.getDiscountType === PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage)) {
      type.getDiscountValue.disable();
      type.getDiscountValue.updateValueAndValidity();
    }

    if (value.type.maxUsesPerOrder) {
      type.maxUsesPerOrderValue.setValidators([Validators.required]);
      type.maxUsesPerOrderValue.updateValueAndValidity();

      const quantity = Number(value.type.maxUsesPerOrderValue);

      if (!Number.isInteger(quantity)) {
        type.maxUsesPerOrderValue.setErrors({ notInt: true });
      }
    }

    if (!value.type.maxUsesPerOrder) {
      type.maxUsesPerOrderValue.disable();
      type.maxUsesPerOrderValue.updateValueAndValidity();
    }

    return {
      code: value.code,
      businessId: value.businessId,
      description: value.description,
      name: value.description,
      limits: {
        limitOneUsePerCustomer: value.limits.limitOneUsePerCustomer ?? false,
        limitUsage: value.limits.limitUsage ?? false,
        limitUsageAmount: Number(value.limits.limitUsageAmount) ?? null,
      },
      channelSets: value.channelSets ?? [],
      type: {
        type: value.type.type,
        buyRequirementType: value.type.buyRequirementType,
        buyQuantity: Number(value.type.buyQuantity),
        buyType: value.type.buyType,
        buyProducts: value.type.buyProducts ?? [],
        buyCategories: value.type.buyCategories ?? [],
        getQuantity: Number(value.type.getQuantity),
        getType: value.type.getType,
        getProducts: value.type.getProducts ?? [],
        getCategories: value.type.getCategories ?? [],
        getDiscountType: value.type.getDiscountType,
        getDiscountValue: Number(value.type.getDiscountValue),
        maxUsesPerOrder: value.type.maxUsesPerOrder ?? false,
        maxUsesPerOrderValue: Number(value.type.maxUsesPerOrderValue),
      },
      status: value.status ?? PeCouponsStatusEnum.Inactive,
      customerEligibility: value.customerEligibility,
      customerEligibilitySpecificCustomers: value.customerEligibilitySpecificCustomers ?? [],
      customerEligibilityCustomerGroups: value.customerEligibilityCustomerGroups ?? [],
    };
  }

  getFixedAmount(value: PeCoupon): PeCoupon {
    const body: PeCoupon = {
      code: value.code,
      businessId: value.businessId,
      description: value.description,
      name: value.name,
      limits: {
        limitOneUsePerCustomer: value.limits.limitOneUsePerCustomer ?? false,
        limitUsage: value.limits.limitUsage ?? false,
        limitUsageAmount: Number(value.limits.limitUsageAmount) ?? null,
      },
      channelSets: value.channelSets ?? [],
      type: {
        type: value.type.type,
        discountValue: Number(value.type.discountValue),
        appliesTo: value.type.appliesTo,
        appliesToProducts: value.type.appliesToProducts ?? [],
        appliesToCategories: value.type.appliesToCategories ?? [],
        minimumRequirements: value.type.minimumRequirements ?? PeCouponTypeMinimumRequirementsEnum.None,
      },
      status: value.status ?? PeCouponsStatusEnum.Inactive,
      customerEligibility: value.customerEligibility ?? null,
      customerEligibilitySpecificCustomers: value.customerEligibilitySpecificCustomers ?? [],
      customerEligibilityCustomerGroups: value.customerEligibilityCustomerGroups ?? [],
    };

    const limits = (this.couponForm.get('limits') as FormGroup).controls;
    const type = (this.couponForm.get('type') as FormGroup).controls;

    if (value.limits.limitUsage) {
      limits.limitUsageAmount.setValidators([Validators.required]);
      limits.limitUsageAmount.updateValueAndValidity();

      if (!Number.isInteger(Number(value.limits.limitUsageAmount))) {
        limits.limitUsageAmount.setErrors({ notInt: true });
      }
    }

    if (!value.limits.limitUsage) {
      limits.limitUsageAmount.disable();
      limits.limitUsageAmount.updateValueAndValidity();
    }

    type.discountValue.setValidators([Validators.required]);
    type.discountValue.updateValueAndValidity();

    if (value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificCategories) {
      type.appliesToCategories.setValidators([Validators.required]);
      type.appliesToCategories.updateValueAndValidity();
    }

    if (value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificProducts) {
      type.appliesToProducts.setValidators([Validators.required]);
      type.appliesToProducts.updateValueAndValidity();
    }

    if (!(value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificCategories)) {
      type.appliesToCategories.disable();
      type.appliesToCategories.updateValueAndValidity();
    }

    if (!(value.type.appliesTo === PeCouponTypeAppliedToEnum.SpecificProducts)) {
      type.appliesToProducts.disable();
      type.appliesToProducts.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount) {
      body.type.minimumRequirementsPurchaseAmount = Number(value.type.minimumRequirementsPurchaseAmount);

      type.minimumRequirementsPurchaseAmount.setValidators([Validators.required]);
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems) {
      const quantity = Number(value.type.minimumRequirementsQuantityOfItems);

      body.type.minimumRequirementsQuantityOfItems = quantity;

      type.minimumRequirementsQuantityOfItems.setValidators([Validators.required]);
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();

      if (!Number.isInteger(quantity)) {
        type.minimumRequirementsQuantityOfItems.setErrors({ notInt: true });
      }
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount)) {
      type.minimumRequirementsPurchaseAmount.disable();
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems)) {
      type.minimumRequirementsQuantityOfItems.disable();
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();
    }

    return body;
  }

  getFreeShipping(value: PeCoupon): PeCoupon {
    const body: PeCoupon = {
      code: value.code,
      businessId: value.businessId,
      description: value.description,
      name: value.name,
      limits: {
        limitOneUsePerCustomer: value.limits.limitOneUsePerCustomer ?? false,
        limitUsage: value.limits.limitUsage ?? false,
        limitUsageAmount: Number(value.limits.limitUsageAmount) ?? null,
      },
      channelSets: value.channelSets ?? [],
      type: {
        type: value.type.type,
        freeShippingToCountries: value.type.freeShippingToCountries ?? [],
        freeShippingType: value.type.freeShippingType ?? null,
        excludeShippingRatesOverCertainAmount: value.type.excludeShippingRatesOverCertainAmount ?? false,
        excludeShippingRatesOverCertainAmountValue: Number(
          value.type.excludeShippingRatesOverCertainAmountValue) ?? null,
        minimumRequirements: value.type.minimumRequirements ?? PeCouponTypeMinimumRequirementsEnum.None,
      },
      status: value.status ?? PeCouponsStatusEnum.Inactive,
      customerEligibility: value.customerEligibility ?? null,
      customerEligibilitySpecificCustomers: value.customerEligibilitySpecificCustomers ?? [],
      customerEligibilityCustomerGroups: value.customerEligibilityCustomerGroups ?? [],
    };

    const limits = (this.couponForm.get('limits') as FormGroup).controls;
    const type = (this.couponForm.get('type') as FormGroup).controls;

    if (value.limits.limitUsage) {
      limits.limitUsageAmount.setValidators([Validators.required]);
      limits.limitUsageAmount.updateValueAndValidity();

      if (!Number.isInteger(Number(value.limits.limitUsageAmount))) {
        limits.limitUsageAmount.setErrors({ notInt: true });
      }
    }

    if (!value.limits.limitUsage) {
      limits.limitUsageAmount.setValidators([Validators.required]);
      limits.limitUsageAmount.updateValueAndValidity();
    }

    if (value.type.freeShippingType === PeCouponTypeFreeShippingTypeEnum.SelectedCountries) {
      type.freeShippingToCountries.setValidators([Validators.required]);
      type.freeShippingToCountries.updateValueAndValidity();
    }

    if (!(value.type.freeShippingType === PeCouponTypeFreeShippingTypeEnum.SelectedCountries)) {
      type.freeShippingToCountries.setValidators([Validators.required]);
      type.freeShippingToCountries.updateValueAndValidity();
    }

    if (value.type.excludeShippingRatesOverCertainAmount) {
      type.excludeShippingRatesOverCertainAmountValue.setValidators([Validators.required]);
      type.excludeShippingRatesOverCertainAmountValue.updateValueAndValidity();
    }

    if (value.type.excludeShippingRatesOverCertainAmount) {
      type.excludeShippingRatesOverCertainAmountValue.disable();
      type.excludeShippingRatesOverCertainAmountValue.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount) {
      body.type.minimumRequirementsPurchaseAmount = Number(value.type.minimumRequirementsPurchaseAmount);

      type.minimumRequirementsPurchaseAmount.setValidators([Validators.required]);
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems) {
      const quantity = Number(value.type.minimumRequirementsQuantityOfItems);

      body.type.minimumRequirementsQuantityOfItems = quantity;

      type.minimumRequirementsQuantityOfItems.setValidators([Validators.required]);
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();

      if (!Number.isInteger(quantity)) {
        type.minimumRequirementsQuantityOfItems.setErrors({ notInt: true });
      }
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount)) {
      type.minimumRequirementsPurchaseAmount.disable();
      type.minimumRequirementsPurchaseAmount.updateValueAndValidity();
    }

    if (!(value.type.minimumRequirements === PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems)) {
      type.minimumRequirementsQuantityOfItems.disable();
      type.minimumRequirementsQuantityOfItems.updateValueAndValidity();
    }

    return body;
  }

  private getProducts() {
    this.apiService
      .getProducts()
      .pipe(
        map(request =>
              request.data.getProducts.products.filter(product => !!product),
        ),
        tap(products => (this.products = products)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private getGroupsOfCustomers() {
    this.apiService
      .getContactGroups()
      .pipe(
        map((request) => {
          this.groupsOfCustomersSource = request.data.groups.nodes;
          return request.data.groups.nodes.map(group => ({
            id: group.id,
            title: group.name,
          }));
        }),
        tap(
          groupsOfCustomers => (this.groupsOfCustomers = groupsOfCustomers),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private getCustomers() {
    this.apiService
      .getContacts()
      .pipe(
        map((request) => {
          this.customersSource = request.data.contacts.nodes;

          return request.data.contacts.nodes.map((contact) => {
            const customer = { id: contact.id, title: null, email: contact.email, phone: contact.phone };
            contact.contactFields.nodes.map(
              node => (customer[node.field.name] = node.value),
            );
            customer.title = customer.email ?? customer.phone;
            return customer;
          });
        }),
        tap(customers => (this.customers = customers)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private getCategories() {
    this.apiService
      .getCategories()
      .pipe(
        map(request =>
              request.data.getCategories.filter(categories => !!categories),
        ),
        tap(categories => (this.categories = categories)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

}
