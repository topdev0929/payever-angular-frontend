import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDataGridItem, EnvService } from '@pe/common';

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
import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { DestroyService } from '../../../misc/services/destroy.service';

@Component({
  selector: 'pe-move-to-folder-form',
  templateUrl: './move-to-folder.dialog.html',
  styleUrls: ['./move-to-folder.dialog.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMoveToFolderDialog implements OnInit {

  folders: PeFolder[];
  edit = false;

  public refreshSubject$ = new BehaviorSubject(true);
  public selectedCoupon = new BehaviorSubject<PeDataGridItem>(null);
  private selectedFolder: any;

  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  loadFolders = new BehaviorSubject<boolean>(null);
  loadCoupons = new BehaviorSubject<boolean>(null);

  constructor(
    private peOverlayRef: PeOverlayRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private envService: EnvService,
    private apiService: PeCouponsApi,
    private readonly destroy$: DestroyService,
  ) {
  }


  moveToFolderForm: FormGroup = this.formBuilder.group({
    businessId: [this.envService.businessId],
    limits: this.formBuilder.group({
      limitOneUsePerCustomer: [false],
      limitUsage: [false],
      limitUsageAmount: [],
    }),
    name: ['name'],
    type: this.formBuilder.group({
      folderData: [PeFolder],
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
      getFolders: [[]],
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


  private getCouponsFolders() {
    const mapTreeNodeToFolder = (couponsFolderTree) => {
      return couponsFolderTree.map((treeFolder) => {
        treeFolder.name = treeFolder.name;
        return treeFolder;
      });
    };
    return this.apiService
      .getCouponsFolders()
      .pipe(
        takeUntil(this.destroy$),
        tap((couponsFolderTree) => {
          this.folders = [...mapTreeNodeToFolder(couponsFolderTree)];
          this.refreshSubject$.next(true);
          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  ngOnInit() {
    of([''])
    .pipe(
      switchMap(() => {
        return this.loadFolders.pipe(switchMap(() => this.getCouponsFolders()));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onClose(): void {
    this.peOverlayRef.close();
  }

  async onSave() {
    this.peOverlayRef.close({
      folderId: this.moveToFolderForm.get('type').get('folderData').value.id, couponId: this.overlayData.id,
    });
  }

}
