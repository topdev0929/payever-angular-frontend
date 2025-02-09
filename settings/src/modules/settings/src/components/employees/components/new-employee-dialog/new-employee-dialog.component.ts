import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { AppThemeEnum } from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaContainerType } from '@pe/media';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { PePickerDataInterface } from '@pe/ui/components/picker/interface';
import { BehaviorSubject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/internal/operators';
import { skip } from 'rxjs/operators';
import {
  BusinessEmployeesGroupInterface,
  EmployeeStatusEnum,
  ListOptionInterface, PositionInterface,
} from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService, EnvironmentConfigService, ValidationErrorsMapperService } from '../../../../services';
import { AbstractComponent } from '../../../abstract';
import { employeePositionsOptions, employeeStatusOptions } from '../../constants';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';
import { AclsService } from '../../services/acls/acls.service';
import {
  EmployeeFields,
  PebEmployeeDialogFormService,
} from '../../services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';

@Component({
  selector: 'peb-new-employee-dialog',
  templateUrl: './new-employee-dialog.component.html',
  styleUrls: ['./new-employee-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AclsService, PebEmployeeDialogFormService, PebEmployeeDialogService],
})
export class NewEmployeeDialogComponent extends AbstractComponent implements OnInit {
  theme = this.businessEnvService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  readonly defaultLogoUrl = `${this.configService.getCustomConfig().translation}/icons-settings/new-employee-logo.svg`;
  private readonly mediaType = MediaContainerType.Images;
  emailErrorMessage = '';
  address = '';
  countries = [];
  showImageLoader = false;
  form: FormGroup;

  selectedStatus: ListOptionInterface<EmployeeStatusEnum>;
  selectedPosition: PePickerDataInterface;
  selectedCountry: PePickerDataInterface;
  groups: BusinessEmployeesGroupInterface[] = [];
  currentGroup = null;

  statuses: Array<ListOptionInterface<EmployeeStatusEnum>> = employeeStatusOptions.map(
    ({labelKey, value}) => ({value, label: this.translationService.translate(labelKey)}),
  );

  userPositions: PePickerDataInterface[] = employeePositionsOptions
    .map(({value, labelKey}) => ({
      value,
      label: this.translationService.translate(labelKey),
    }));

  get isCreationMode(): boolean {
    return !this.overlayData.data.employee;
  }

  get employeeLogo(): string {
    const logo = this.form.controls.logo.value;
    const fullUrl = `${this.configService.getCustomConfig().storage}/${this.mediaType}/${logo}`;

    return logo ? fullUrl : this.defaultLogoUrl;
  }

  getFieldValidity(fieldName: EmployeeFields): boolean {
    const field = this.form.get(fieldName);

    return field.dirty && field.invalid;
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public aclsService: AclsService,
    private dialogRef: PeOverlayRef,
    private fb: FormBuilder,
    private errorsMessagesService: ValidationErrorsMapperService,
    private apiService: ApiService,
    private translationService: TranslateService,
    private dialogFormService: PebEmployeeDialogFormService,
    private dialogService: PebEmployeeDialogService,
    private businessEnvService: BusinessEnvService,
    private cdr: ChangeDetectorRef,
    private configService: EnvironmentConfigService,
    private localConstantsService: LocaleConstantsService,
  ) {
    super();
  }

  getFieldErrorText(field: EmployeeFields): string {
    const fieldErrors: ValidationErrors = this.form.get(field).errors || {};
    const flattenErrors: ValidationErrors = {};
    const patternError = fieldErrors.pattern;

    Object.entries(fieldErrors || {})
      .filter(([, errorValue]) => typeof errorValue === 'boolean')
      .forEach(([errorName, errorValue]) => flattenErrors[errorName] = errorValue);

    if (patternError) {
      flattenErrors[patternError.requiredPattern] = true;
    }

    const allMessages = this.errorsMessagesService.getAllErrorMessages(flattenErrors);

    return allMessages[0] || '';
  }

  get aclsGroup(): any {
    return this.form.controls.acls;
  }

  ngOnInit(): void {
    this.getCountries();
    this.form = this.dialogFormService.initFormGroup(this.overlayData.data.employee);
    this.currentGroup = this.overlayData.data.groupId || null;
    this.setEmployeesInitialFields();

    this.dialogService.getInstalledAppsAndAcls$(this.businessEnvService.businessUuid, this.overlayData.data.employee?._id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([apps, acls]) => {
        this.aclsService.init({
          apps,
          acls,
          appControls: this.aclsGroup,
          destroyed$: this.destroyed$,
        });

        this.cdr.detectChanges();
      });

    this.form.controls.email.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(
      res => {
        if (this.emailErrorMessage) {
          this.emailErrorMessage = '';
          this.cdr.detectChanges();
        }
      },
    );
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.createEmployee();
    });
  }

  onFileChange(file: File[]) {
    this.toggleImageLoader();

    this.dialogService.getImageBlobName$(this.overlayData.data.businessId, this.mediaType, file[0]).pipe(
      finalize(() => this.toggleImageLoader()),
      takeUntil(this.destroyed$),
    ).subscribe(blobName => {
      this.form.controls.logo.setValue(blobName);
    });
  }

  logoPickerSelectChanged(status: EmployeeStatusEnum) {
    this.selectedStatus = this.statuses.find(statusOption => statusOption.value === status);
    this.form.controls.status.setValue(status);
  }

  createEmployee() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Object.keys( this.form.controls).forEach(key => {
        this.form.controls[key].markAsDirty();
      });
      this.cdr.detectChanges();

      return;
    }

    const value = this.form.value;
    value.acls = this.aclsService.getAcls();
    value.address = this.form.controls.address.value;

    value.status = value.status || EmployeeStatusEnum.inactive;
    // should be null, cos have another api for add employee into group
    value.groups = null;
    if (this.isCreationMode) {
      this.apiService.createBusinessEmployee(this.overlayData.data.businessId, value).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(createdEmployee => {
        if (this.currentGroup) {
          this.apiService.createBusinessEmployeeInGroup(
            this.businessEnvService.businessUuid,
            this.currentGroup,
            [createdEmployee._id]).subscribe((result: IGroupItemInterface) => {
              this.dialogRef.close({ createdEmployee, group: result });
          });
        } else {
          this.dialogRef.close( { createdEmployee });
        }
      }, error => {
        this.emailErrorMessage = error.error.errors;
        this.cdr.detectChanges();
      });
    } else {
      this.apiService.updateBusinessEmployee(this.overlayData.data.businessId, this.overlayData.data.employee._id, value).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(updatedEmployee => {
        this.dialogRef.close({ updatedEmployee });
      }, error => {
        this.emailErrorMessage = error.error.errors;
        this.cdr.detectChanges();
      });
    }
  }

  private toggleImageLoader() {
    this.showImageLoader = !this.showImageLoader;
    this.cdr.markForCheck();
  }

  private setEmployeesInitialFields() {
    if (this.isCreationMode) {
      return;
    }
    const { employee } = this.overlayData.data;
    const allPositions: PositionInterface[] = Array.isArray(employee?.positions)
      ? employee?.positions
      : [employee?.positions] || [];

    const position: PositionInterface = allPositions.find(pos => pos?.businessId === this.overlayData.data.businessId);

    const existedStatusValue = position?.status;
    const existedPosition = position?.positionType;
    const existedCountry = employee?.address?.country;

    this.selectedStatus = {
      value: existedStatusValue,
      label: this.statuses.find(status => status?.value === existedStatusValue)?.label || '',
    };

    this.selectedPosition = {
      value: existedPosition,
      label: this.userPositions.find(pos => pos?.value === existedPosition)?.label || '',
    };

    const selectedCountry = this.countries.find(val => val.value?.toLowerCase() === existedCountry?.toLowerCase());
    this.selectedCountry = {
      value: selectedCountry?.value || '',
      label: selectedCountry?.label || '',
    };

    this.setAddressValue();
  }

  onAutocompleteSelected(places) {
    const addressForm = this.form.controls.address;

    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';
    addressForm.get('zipCode').setValue(postCode);
    addressForm.get('city').setValue(city);
    addressForm.get('country').setValue(country?.short_name);
    addressForm.get('street').setValue(`${streetName} ${streetNumber}`);
    this.selectedCountry = this.countries.find(val => val.value?.toLowerCase() === country?.short_name?.toLowerCase());
    this.address = places.formatted_address;
    this.cdr.detectChanges();
  }

  setAddressValue() {
    const addressForm = this.form.controls.address;
    this.selectedCountry = this.selectedCountry || this.countries.find(val => val.value?.toLowerCase() === addressForm.get('country').value?.toLowerCase());
    this.address = `${addressForm.get('street').value || ''}, ${addressForm.get('zipCode').value || ''}, ${addressForm.get('city').value || ''}, ${this.selectedCountry?.label || ''}`;
    this.cdr.detectChanges();
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).forEach((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }
}
