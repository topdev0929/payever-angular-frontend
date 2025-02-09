import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { CoreConfigService } from '../../../../services';

@Component({
  selector: 'peb-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditCompanyComponent implements OnInit {
  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public employees = [];
  public  sales = [];
  public products = [];
  public industry = [];
  public legalForms = [];
  public data: any;

  public companyForm: FormGroup = this.formBuilder.group({
    legalForm: [this.legalForms ?? '', [Validators.required]],
    salesRange: [this.sales ?? '', [Validators.required]],
    industry: [this.industry ?? '', [Validators.required]],
    product: [this.products ?? '', [Validators.required]],
    employeesRange: [this.employees ?? '', [Validators.required]],
    urlWebsite: [''],
  });

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private coreConfigService: CoreConfigService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.sales = this.getRangeFromConst(this.coreConfigService.SALES, 'sales');
    this.employees = this.getRangeFromConst(this.coreConfigService.EMPLOYEES, 'employees');
    this.industry = this.getListFromConst(this.coreConfigService.INDUSTRY_SECTORS, 'industry');
    this.products = this.getListFromConst(this.coreConfigService.PRODUCTS, 'product');
    this.legalForms = this.getListFromConst(this.coreConfigService.LEGAL_FORMS, 'legal_form');
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
      const details = this.overlayData.data.details.companyDetails;
      details.salesRange = `${details.salesRange?.min},${details.salesRange?.max}`;
      details.employeesRange = `${details.employeesRange?.min},${details.employeesRange?.max}`;
      this.companyForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSave() {
    if (this.companyForm.valid) {
      this.data['businessDetail'] = { companyDetails: this.companyForm.value };
      const sales = this.sales.find(val => val.value === this.data.businessDetail.companyDetails.salesRange);
      this.data.businessDetail.companyDetails.salesRange = { min: sales?.min, max: sales?.max };
      const employees =
        this.employees.find(val => val.value === this.data.businessDetail.companyDetails.employeesRange);
      this.data.businessDetail.companyDetails.employeesRange = { min: employees?.min, max: employees?.max };
      this.peOverlayRef.close({ data: this.data });
    }
  }

  private getListFromConst(array: string[], translateKey: string) {
    return array?.map((field: any) => {
      return {
        value: field.hasOwnProperty('label') ? field.label : field,
        label: this.translateService.translate(
          `assets.${translateKey}.${field.hasOwnProperty('label') ? field.label : field}`,
        ),
      };
    });
  }

  private getRangeFromConst(array: object[], translateKey: string) {
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
