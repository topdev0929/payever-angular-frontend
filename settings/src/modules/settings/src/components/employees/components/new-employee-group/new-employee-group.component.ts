import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { skip } from 'rxjs/operators';
import {
  EmployeeStatusEnum,
  ListOptionInterface,
} from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService, ValidationErrorsMapperService } from '../../../../services';
import { AbstractComponent } from '../../../abstract';
import { employeeStatusOptions } from '../../constants';
import { AclsService } from '../../services/acls/acls.service';
import {
  PebEmployeeDialogFormService,
} from '../../services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';

@Component({
  selector: 'peb-new-employee-group',
  templateUrl: './new-employee-group.component.html',
  styleUrls: ['./new-employee-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AclsService, PebEmployeeDialogFormService, PebEmployeeDialogService],
})
export class NewEmployeeGroupComponent extends AbstractComponent implements OnInit {
  theme = this.businessEnvService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  showImageLoader = false;
  form: FormGroup;

  group = null;

  statuses: Array<ListOptionInterface<EmployeeStatusEnum>> = employeeStatusOptions.map(
    ({labelKey, value}) => ({value, label: this.translationService.translate(labelKey)}),
  );

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
  ) {
    super();
  }

  get aclsGroup(): any {
    return this.form.controls.acls;
  }

  ngOnInit(): void {
    this.form = this.initFormGroup();

    this.dialogService.getInstalledAppsAndAclsGroups$(this.businessEnvService.businessUuid, this.overlayData.data?.groupId)
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

    if (this.overlayData.data.groupId) {
      this.form.controls.name.setValue(this.overlayData.data.group.name);
    }

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.createEmployeeGroup();
    });
  }

  createEmployeeGroup() {
    this.form.controls.name.setValidators([Validators.required]);
    this.form.controls.name.updateValueAndValidity();

    if (!this.form.valid) {
      this.cdr.detectChanges();

      return;
    }

    const value = this.form.value;
    value.acls = this.aclsService.getAcls();
    if (this.overlayData.data?.groupId) {
      this.apiService.updateBusinessEmployeeGroup(this.overlayData.data.businessId, value, this.overlayData.data.groupId).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(updatedEmployeeGroup => {
        this.dialogRef.close(updatedEmployeeGroup);
      }, error => {
        this.cdr.detectChanges();
      });
    } else {
      this.apiService.createBusinessEmployeeGroup(this.overlayData.data.businessId, value).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(createdEmployeeGroup => {
        this.dialogRef.close(createdEmployeeGroup);
      }, error => {
        this.cdr.detectChanges();
      });
    }
  }

  private toggleImageLoader() {
    this.showImageLoader = !this.showImageLoader;
    this.cdr.markForCheck();
  }

  initFormGroup(): FormGroup {
    let form: FormGroup;
    const formObj = {
      name: [null],
      acls: [null],
    };

    form = this.fb.group(formObj);

    form.controls.acls = this.fb.group({});

    return form;
  }
}
