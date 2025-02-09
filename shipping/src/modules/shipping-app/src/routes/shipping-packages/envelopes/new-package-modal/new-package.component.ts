import { ChangeDetectionStrategy, Component, Inject, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { AbstractComponent } from '../../../../misc/abstract.component';
import { SizeMeasurementUnitsEnum } from '../../../../enums/SizeMeasurementUnitsEnum';
import { WeightMeasurementUnitsEnum } from '../../../../enums/WeightMeasurementUnitsEnum';
import { PackageTypeEnum } from '../../../../enums/PackageTypeEnum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PeOverlayRef, PE_OVERLAY_DATA, PE_OVERLAY_SAVE, OverlayHeaderConfig, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { PebShippingPackagesService } from '../../shipping-packages.service';
import { EnvService } from '@pe/common';
import { ShippingPackageInterface } from '../../../../interfaces/shipping-package.interface';
import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'peb-new-package-dialog',
  templateUrl: './new-package.component.html',
  styleUrls: ['./new-package.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebNewPackageComponent extends AbstractComponent implements OnInit {
  edit = false;
  theme;
  packageTypeEnum = PackageTypeEnum;

  sizeMeasurementUnits = [
    { label: 'Milimeter', value: SizeMeasurementUnitsEnum.MILIMETER },
    { label: 'Centimeters', value: SizeMeasurementUnitsEnum.CENTIMETER },
    { label: 'Meters', value: SizeMeasurementUnitsEnum.METER },
    { label: 'Inch', value: SizeMeasurementUnitsEnum.INCH },
    { label: 'Foot', value: SizeMeasurementUnitsEnum.FOOT },
    { label: 'Foot US', value: SizeMeasurementUnitsEnum.FOOT_US },
    { label: 'Yard', value: SizeMeasurementUnitsEnum.YARD },
  ];

  weightMeasurementUnits = [
    { label: 'Microgramme', value: WeightMeasurementUnitsEnum.MICROGRAMME },
    { label: 'Miligrams', value: WeightMeasurementUnitsEnum.MILIGRAM },
    { label: 'Grams', value: WeightMeasurementUnitsEnum.GRAMS },
    { label: 'Kilograms', value: WeightMeasurementUnitsEnum.KILOGRAMS },
    { label: 'Ounce', value: WeightMeasurementUnitsEnum.OUNCE },
    { label: 'Pound', value: WeightMeasurementUnitsEnum.POUND },
    { label: 'Tonne', value: WeightMeasurementUnitsEnum.TONNE },
    { label: 'Megatonne', value: WeightMeasurementUnitsEnum.MEGATONNE },
  ];

  packageBoxTypes = [
    { label: 'Box', value: PackageTypeEnum.Box },
    { label: 'Envelope', value: PackageTypeEnum.Envelope },
    {
      label: 'Soft package/satchel',
      value: PackageTypeEnum.Soft,
    },
  ];

  carrierBoxes = [];
  carrierValid = true;

  discountTypes = [{ label: 'Free', value: 'FREE' }];

  discounts = [{ label: 'Free', value: 'FREE' }];

  packageKind = [
    { label: 'Custom package', value: 'Custom' },
  ];

  shippingPackageForm: FormGroup = this.formBuilder.group({
    name: '',
    type: [PackageTypeEnum.Box],
    dimensionUnit: [SizeMeasurementUnitsEnum.CENTIMETER],
    length: [''],
    width: [''],
    height: [''],
    weightUnit: [WeightMeasurementUnitsEnum.KILOGRAMS],
    weight: [''],
    isDefault: [],
  });

  shippingPackageKind = this.formBuilder.control('Custom');

  carrierShippingPackages = [];

  packageTypes = PackageTypeEnum;
  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private shippingBoxService: PebShippingPackagesService,
    private envService: EnvService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.shippingBoxService.getCarrierBoxes().subscribe((res: any) => {
      this.carrierBoxes = res.filter(carrier => carrier?.integration?.name !== 'custom' && carrier?.enabled && carrier?.boxes?.length > 0);
      if (this.carrierBoxes?.length > 0) {
        this.packageKind.push({ label: 'Carrier package', value: 'Carrier' });
      }
    });
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });

    const couponId = this.overlayData?.data?.id;

    if (this.overlayData.new) {
      this.shippingPackageForm.get('type').setValue(this.overlayData.new);
    }

    if (couponId) {
      this.edit = true;
    }
    if (this.edit) {
      const formData: ShippingPackageInterface = this.overlayData.data.data;
      this.shippingPackageForm.patchValue(formData);
    }
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onCheckValidity() {
    const value = this.shippingPackageForm.controls;
    if (this.shippingPackageKind.value.toLowerCase() === 'custom') {
      value.name.setValidators([Validators.required]);
      value.name.updateValueAndValidity();

      value.length.setValidators([Validators.required]);
      value.length.updateValueAndValidity();

      value.width.setValidators([Validators.required]);
      value.width.updateValueAndValidity();

      if (value.type.value !== PackageTypeEnum.Envelope) {
        value.height.setValidators([Validators.required]);
        value.height.updateValueAndValidity();
      } else {
        value.height.setValue(0);
      }

      value.weight.setValidators([Validators.required]);
      value.weight.updateValueAndValidity();
      this.carrierValid = true;
    } else {
      this.carrierValid = this.carrierShippingPackages.length >= 1;
    }

    this.cdr.detectChanges();

    if (this.shippingPackageForm.valid && this.carrierValid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.shippingPackageKind.value === 'Carrier') {
      const shippingBoxData = [];
      this.carrierShippingPackages.forEach((element) => {
        shippingBoxData.push({
          name: element.name,
          business: this.envService.businessId,
          dimensionUnit: element.dimensionUnit,
          weightUnit: element.weightUnit,
          kind: 'Carrier',
          length: element.length,
          width: element.width,
          height: element.height,
          weight: element.weight,
          isDefault: element.isDefault,
          type: element.type,
        });
      });
      this.peOverlayRef.close({ data: shippingBoxData, kind: 'Carrier' });
    }
    if (this.shippingPackageForm.valid) {
      if (this.edit) {
        this.peOverlayRef.close({
          data: this.shippingPackageForm.value,
          id: this.overlayData.data.id,
        });
      }
      this.peOverlayRef.close(this.shippingPackageForm.value);
    }
  }

  handleBoxes(event, box) {
    if (event.checked) {
      this.carrierShippingPackages.push(box);
    } else {
      if (this.carrierShippingPackages.indexOf(box) !== -1) {
        box.isDefault = false;
        this.carrierShippingPackages.splice(this.carrierShippingPackages.indexOf(box), 1);
      }
    }
    this.carrierValid = this.carrierShippingPackages.length >= 1;
  }

  makeDefault(box, i) {
    this.carrierBoxes[i].boxes.forEach((val) => {
      if (val._id === box._id) {
        val.isDefault = true;
        if (!this.carrierShippingPackages?.find(item => item._id === val._id)) {
          this.carrierShippingPackages.push(box);
        }
      } else {
        val.isDefault = false;
      }
    });
  }

  isChecked(box) {
    return this.carrierShippingPackages.find(val => val._id === box._id);
  }

  numericOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return !(charCode === 101 || charCode === 69 || charCode === 44 || charCode === 43 || charCode === 45);
  }
}
