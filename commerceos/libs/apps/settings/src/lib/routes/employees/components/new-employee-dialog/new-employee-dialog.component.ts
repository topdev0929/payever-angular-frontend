import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, forkJoin, merge, Observable } from 'rxjs';
import { catchError, filter, finalize, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaContainerType } from '@pe/media';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PePickerDataInterface } from '@pe/ui';

import {
  BusinessEmployeeInterface,
  BusinessEmployeesGroupInterface,
  EmployeeStatusEnum,
  ListOptionInterface,
  NewBusinessEmployeeInterface,
} from '../../../../misc/interfaces';
import {
  ApiService,
  BusinessEnvService,
  EnvironmentConfigService,
  FormTranslationsService,
} from '../../../../services';
import { employeePositionsOptions, employeeStatusOptions } from '../../constants';
import { CreateEmployeeDialogDataInterface } from '../../interfaces';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';
import { AclsService } from '../../services/acls/acls.service';
import { PebBusinessEmployeesStorageService } from '../../services/business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';
import {
  EmployeeFields,
  PebEmployeeDialogFormService,
} from '../../services/employee-dialog-form/peb-employee-dialog-form.service';


@Component({
  selector: 'peb-new-employee-dialog',
  templateUrl: './new-employee-dialog.component.html',
  styleUrls: ['./new-employee-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AclsService, PebEmployeeDialogFormService, PebEmployeeDialogService, PeDestroyService],
})
export class NewEmployeeDialogComponent implements OnInit {

  readonly defaultLogoUrl = `${this.configService.getCustomConfig().translation}/icons-settings/new-employee-logo.svg`;

  private readonly mediaType = MediaContainerType.Images;
  address = '';
  countries = [];
  showImageLoader = false;
  form: FormGroup;

  selectedStatus: ListOptionInterface<EmployeeStatusEnum>;
  selectedPosition: PePickerDataInterface;
  selectedCountry: PePickerDataInterface;
  groups: BusinessEmployeesGroupInterface[] = [];
  currentGroup = null;

  @ViewChild('matGoogleMapsAutocompleteControl') matGoogleMapsControl: ElementRef;

  statuses: Array<ListOptionInterface<EmployeeStatusEnum>> = employeeStatusOptions.map(({ value, labelKey }) => ({
    value,
    label: this.translationService.translate(labelKey),
  }));

  userPositions: PePickerDataInterface[] = employeePositionsOptions.map(({ value, labelKey }) => ({
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
    @Inject(PE_OVERLAY_DATA) public overlayData: { data: CreateEmployeeDialogDataInterface },
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public aclsService: AclsService,
    private dialogRef: PeOverlayRef,
    private errorsMessagesService: FormTranslationsService,
    private apiService: ApiService,
    private translationService: TranslateService,
    private dialogFormService: PebEmployeeDialogFormService,
    private dialogService: PebEmployeeDialogService,
    private businessEnvService: BusinessEnvService,
    private cdr: ChangeDetectorRef,
    private configService: EnvironmentConfigService,
    private localConstantsService: LocaleConstantsService,
    private destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private overlayRef: PeOverlayRef,
    protected employeesStorage: PebBusinessEmployeesStorageService,
    private activatedRoute: ActivatedRoute
  ) {}

  getAppTitle(key: string): string {
    return this.aclsService.appsTitle.get(key);
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
    this.overlayData.data.dirty$.next(false);
    this.getCountries();
    this.form = this.dialogFormService.initFormGroup(this.overlayData.data.employee);
    this.currentGroup = this.overlayData.data.groupId || null;
    this.setEmployeesInitialFields();
    this.dialogFormService.markAllAsPristine();

    const onceMarkedAsDirty = this.dialogFormService.valueChanges$.pipe(
      filter(()=> this.dialogFormService.dirty),
      take(1),
      tap(()=> this.overlayData.data.dirty$.next(true)),
    );

    merge(
      onceMarkedAsDirty,
      this.dialogService
        .getInstalledAppsAndAclsAndPositions$(this.businessEnvService.businessUuid, this.overlayData.data.employee?._id)
        .pipe(
          tap(([apps, acls, positions]) => {
            const existedStatusValue = this.overlayData.data.employee?.status
              ? Number(this.overlayData.data.employee.status)
              : EmployeeStatusEnum.invited;
            const existedPosition =
              this.overlayData.data.employee?.positions[this.overlayData.data.employee?.positions.length - 1]
                .positionType;

            if (existedStatusValue !== null && existedStatusValue !== undefined) {
              this.selectedStatus = {
                value: existedStatusValue,
                label: this.statuses.find(status => status?.value === existedStatusValue)?.label || '',
              };
            }

            this.selectedPosition = {
              value: existedPosition,
              label: this.userPositions.find(pos => pos?.value === existedPosition)?.label || '',
            };
            this.aclsService.init({
              apps,
              acls,
              appControls: this.aclsGroup,
            });

            this.cdr.markForCheck();
          }),
        ),
      this.overlaySaveSubject.pipe(
        skip(1),
        tap(() => {
          this.saveEmployeeData();
        }),
      ),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onFileChange(file: File[]) {
    this.toggleImageLoader();

    this.dialogService
      .getImageBlobName$(this.overlayData.data.businessId, this.mediaType, file[0])
      .pipe(
        finalize(() => this.toggleImageLoader()),
        take(1),
        tap((blobName) => {
          this.form.controls.logo.markAsDirty();
          this.form.controls.logo.setValue(blobName);
        }),
      )
      .subscribe();
  }

  logoPickerSelectChanged(status: EmployeeStatusEnum) {
    this.selectedStatus = this.statuses.find(statusOption => statusOption.value === status);
    this.form.controls.status.markAsDirty();
    this.form.controls.status.setValue(status);
  }

  handleInvalidForm(form: FormGroup) {
    form.markAllAsTouched();
    Object.keys(form.controls).forEach((key) => {
      form.controls[key]?.markAsDirty();
    });
  }

  saveEmployeeData() {
    const addressForm = this.form.controls.address as FormGroup;
    if (this.form.invalid || addressForm.invalid) {
      this.handleInvalidForm(this.form);
      this.handleInvalidForm(addressForm);
      this.cdr.detectChanges();

      return;
    }

    const acls = this.aclsService.getAcls();

    if (!acls.some(({ read }) => read)) {
      this.snackbarService.toggle(true, {
        content: this.translationService.translate('dialogs.new_employee.action_result.errors.acls.invalid'),
      });

      return;
    }
    const formValue = this.form.getRawValue();
    const groupId = this.employeesStorage.groups.data.find(group => group.name ===
        this.activatedRoute.snapshot.queryParams['category'])?._id;

    const value: NewBusinessEmployeeInterface = {
      ...formValue,
      acls,
      address: this.form.controls.address.value,
      status: formValue.status || EmployeeStatusEnum.inactive,
    };

    if (groupId){
      value.groups = [groupId];
    }

    this.currentGroup = groupId;
    let BEmployee: Observable<Object>;

    value.first_name = value.first_name.trim();
    value.last_name = value.last_name.trim();

    if (this.isCreationMode) {
      BEmployee = this.createEmployee(value);
    } else {
      BEmployee = this.patchEmployee(value);
    }

    BEmployee.pipe(
      takeUntil(this.destroy$),
      catchError(({ error }) => {
        this.snackbarService.toggle(true, {
          content: this.translationService.translate(
            error.translationKey ??
            error.errors ??
            error.message ??
            'errors.unknown_error'
          ),
        });

        return EMPTY;
      }),
    ).subscribe();
  }

  private toggleImageLoader() {
    this.showImageLoader = !this.showImageLoader;
    this.cdr.markForCheck();
  }

  private createEmployee(
    value: NewBusinessEmployeeInterface,
  ): Observable<[IGroupItemInterface, BusinessEmployeeInterface] | BusinessEmployeeInterface> {
    return this.apiService.createBusinessEmployee(this.overlayData.data.businessId, value).pipe(
      switchMap((createdEmployee) => {
        const updateEmployee: any = {
          status: value.status,
          email: value.email,
          position: value.position,
          acls: value.acls,
          first_name: value.first_name,
          last_name: value.last_name,
        };

        if (value.groups){
          updateEmployee.groups = value.groups;
        }

        if (this.currentGroup) {
          return forkJoin([
            this.apiService.createBusinessEmployeeInGroup(this.businessEnvService.businessUuid, this.currentGroup, [
              createdEmployee._id,
            ]),
            this.apiService.postUpdateBusinessEmployee(
              this.overlayData.data.businessId,
              createdEmployee._id,
              updateEmployee,
            ),
          ]).pipe(
            tap(([group, updatedEmployee]) => {
              this.dialogRef.close({ createdEmployee: { ...createdEmployee, ...updatedEmployee }, group });
            }),
          );
        } else {
          return this.apiService
            .postUpdateBusinessEmployee(this.overlayData.data.businessId, createdEmployee._id, updateEmployee)
            .pipe(
              tap({
                next: updatedEmployee =>
                  this.dialogRef.close({
                    createdEmployee: { ...createdEmployee, ...updatedEmployee },
                  }),
              }),
            );
        }
      }),
    );
  }

  private patchEmployee(value: NewBusinessEmployeeInterface): Observable<BusinessEmployeeInterface> {
    return this.apiService
      .updateBusinessEmployee(this.overlayData.data.businessId, this.overlayData.data.employee._id, value)
      .pipe(
        tap((updatedEmployee) => {
          this.dialogRef.close({ updatedEmployee: { ...updatedEmployee, status: value.status } });
        }),
      );
  }


  private setEmployeesInitialFields() {
    if (this.isCreationMode) {
      return;
    }
    const { employee } = this.overlayData.data;

    const existedCountry = employee?.address?.country;

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
    this.cdr.detectChanges();
  }

  getCountryFieldValidity(): boolean {
    const addressForm = this.form.controls.address as FormGroup;
    const { invalid } = addressForm.controls.country;

    return invalid;
  }

  getCountryFieldErrorText(): string {
    const addressForm = this.form.controls.address as FormGroup;
    const fieldErrors: ValidationErrors = addressForm.controls.country.errors || {};
    const [message] = this.errorsMessagesService.getAllErrorMessages(fieldErrors);

    return message || '';
  }

  onCountryFieldBlur(event) {
    const value = event.target.value;
    const addressForm = this.form.controls.address as FormGroup;
    const { country } = addressForm.controls;

    if (value && !country.value) {
      country.setErrors({ invalid: true });
    }
  }

  getAddressFormatted():string{
    const addressForm = this.form.controls.address;
    const countryValue = addressForm.get('country').value?.toLowerCase();
    this.selectedCountry = this.countries.find(val => val.value?.toLowerCase() === countryValue);
    const street = addressForm.get('street').value || '';
    const zipCode = addressForm.get('zipCode').value || '';
    const city = addressForm.get('city').value || '';
    const country = this.selectedCountry?.label || '';

    return [street, zipCode, city, country].filter((item: string) => !!item.trim()).join(', ');
  }

  setAddressValue() {
    this.cdr.detectChanges();
    if (this.matGoogleMapsControl?.nativeElement) {
      this.matGoogleMapsControl.nativeElement.value = this.getAddressFormatted();
      this.form.controls.address.markAsDirty();
    }
  }

  changeCountryValue(){
    this.setAddressValue();
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
