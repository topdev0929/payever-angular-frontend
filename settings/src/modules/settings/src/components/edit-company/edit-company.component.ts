import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PE_OVERLAY_SAVE, PeOverlayRef } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { ApiService, CoreConfigService } from '../../services';
import { AbstractComponent } from '../abstract';
import { MOBILE_PHONE_PATTERN } from '../../misc/constants/validation-patterns.constants';

@Component({
  selector: 'peb-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyComponent extends AbstractComponent implements OnInit {
  businessStatus = [];
  status = [];
  sales = [];
  products = [];
  industry = [];
  theme;
  data;
  companyForm: FormGroup;
   constructor(
     @Inject(PE_OVERLAY_DATA) public overlayData: any,
     @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
     @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
     private formBuilder: FormBuilder,
     private apiService: ApiService,
     private peOverlayRef: PeOverlayRef,
     private cdr: ChangeDetectorRef,
     private coreConfigService: CoreConfigService,
     private translateService: TranslateService,
     ) {
     super();
   }

   ngOnInit(): void {
     this.theme = this.overlayConfig.theme;
     this.businessStatus = this.getListFromConst(this.coreConfigService.BUSINESS_STATUS, 'business_status');
     this.sales = this.getRangeFromConst(this.coreConfigService.SALES, 'sales');
     this.status = this.getListFromConst(this.coreConfigService.STATUS, 'status');
     this.industry = this.getListFromConst(this.coreConfigService.INDUSTRY_SECTORS, 'industry');
     this.products = this.getListFromConst(this.coreConfigService.PRODUCTS, 'product');
     this.companyForm =  this.formBuilder.group({
       name: [''],
       businessStatus: [this.businessStatus],
       status: [this.status],
       salesRange: [this.sales],
       industry: [this.industry],
       product: [this.products],
       phone: [''],
     });
     if (this.overlayData.data.details) {
       this.data = this.overlayData.data.business;
       const details = this.overlayData.data.details.companyDetails;
       details.salesRange = `${details.salesRange?.min},${details.salesRange?.max}`;
       this.companyForm.patchValue(details);
       this.companyForm.controls.name.setValue(this.data.name);
     }
     this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
       this.onCheckValidity();
     });
   }

  onCheckValidity() {
    const value = this.companyForm.controls;
    value.name.setValidators([Validators.required]);
    value.name.updateValueAndValidity();

    value.salesRange.setValidators([Validators.required]);
    value.salesRange.updateValueAndValidity();

    value.industry.setValidators([Validators.required]);
    value.industry.updateValueAndValidity();

    value.status.setValidators([Validators.required]);
    value.status.updateValueAndValidity();

    value.businessStatus.setValidators([Validators.required]);
    value.businessStatus.updateValueAndValidity();

    value.phone.setValidators([Validators.required, Validators.pattern(MOBILE_PHONE_PATTERN)]);
    value.phone.updateValueAndValidity();
    this.cdr.detectChanges();

    if (this.companyForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.companyForm.valid) {
      this.data['businessDetail'] = { companyDetails: this.companyForm.value};
      this.data['name'] = this.companyForm.controls.name.value;
      const sales = this.sales.find(val => val.value === this.data.businessDetail.companyDetails.salesRange);
      this.data.businessDetail.companyDetails.salesRange = { min: sales?.min, max: sales?.max};
      this.peOverlayRef.close({ data: this.data });
    }
  }

  getListFromConst(array, translateKey) {
     return array?.map((field: any) => {
       return {
         value: field.hasOwnProperty('label') ? field.label : field,
         label: this.translateService.translate(`assets.${translateKey}.${field.hasOwnProperty('label') ? field.label : field}`),
       };
     });
  }

  getRangeFromConst(array, translateKey) {
    return array?.map((field: any) => {
      return {
        value: `${field?.min},${field?.max}`,
        label: this.translateService.translate(`assets.${translateKey}.${field.label}`),
        min: field?.min,
        max: field?.max,
      };
    });
  }
}
