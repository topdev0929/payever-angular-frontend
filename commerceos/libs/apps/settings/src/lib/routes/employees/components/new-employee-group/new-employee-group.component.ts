import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, merge } from 'rxjs';
import { catchError, filter, skip, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { EmployeeStatusEnum, ListOptionInterface } from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService, FormTranslationsService } from '../../../../services';
import { employeeStatusOptions } from '../../constants';
import { ICreateEmployeeGroupDialogDataInterface } from '../../interfaces';
import { AclsService } from '../../services/acls/acls.service';
import {
  PebBusinessEmployeesStorageService,
} from '../../services/business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';
import { PebEmployeeDialogFormService } from '../../services/employee-dialog-form/peb-employee-dialog-form.service';
import { IGroupItemInterface, IGroupsInterface } from "../../interfaces/employee-group.interface";

const groupNameValidator = (exisitngGroup: IGroupItemInterface[]): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
  return exisitngGroup.find(group => group.name === control.value)
    ? { groupIsNotUnique: true }
    : null;
}

@Component({
  selector: 'peb-new-employee-group',
  templateUrl: './new-employee-group.component.html',
  styleUrls: ['./new-employee-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AclsService,
    PebEmployeeDialogFormService,
    PebEmployeeDialogService,
    PeDestroyService,
  ],
})
export class NewEmployeeGroupComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public form: FormGroup = this.fb.group({
    name: [null, [
      Validators.required,
      Validators.pattern(/\S+/),
      groupNameValidator(this.employeesStorage.groups.data),
    ]],
    acls: this.fb.group({})
  });

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: { data: ICreateEmployeeGroupDialogDataInterface },
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public aclsService: AclsService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
    private dialogRef: PeOverlayRef,
    private fb: FormBuilder,
    private apiService: ApiService,
    private translationService: TranslateService,
    private dialogService: PebEmployeeDialogService,
    private businessEnvService: BusinessEnvService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
  ) {
  }

  get aclsGroup(): any {
    return this.form.controls.acls;
  }

  ngOnInit(): void {
    this.overlayData.data.dirty$.next(false);

    if (this.overlayData.data.groupId) {
      this.form.controls.name.setValue(this.overlayData.data.group.name);
      this.form.controls.name.disable();
    }

    const OnceMarkedAsDirty = this.ValueChanges$.pipe(
      filter(()=> this.dirty),
      take(1),
      tap(() => this.overlayData.data.dirty$.next(true)),
    );

    merge(
      OnceMarkedAsDirty,
      this.dialogService.getInstalledAppsAndAclsGroups$(
        this.businessEnvService.businessUuid,
        this.overlayData.data?.groupId,
      ).pipe(
        tap(([apps, acls]) => {
          this.aclsService.init({
            apps,
            acls,
            appControls: this.aclsGroup,
          });

          this.cdr.detectChanges();
        }),
      ),
      this.overlaySaveSubject.pipe(
        skip(1),
        tap(() => this.submitTriggerRef.nativeElement.click()),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  createEmployeeGroup() {
    if (!this.form.valid) {
      return;
    }

    const value = this.form.value;
    value.acls = this.aclsService.getAcls();

    let employeeGroup: any = this.apiService.createBusinessEmployeeGroup(this.overlayData.data.businessId, value).pipe(
      tap((createdEmployeeGroup) => {
        this.dialogRef.close(createdEmployeeGroup);
      }),
    );

    if (this.overlayData.data?.groupId) {
      employeeGroup = this.apiService.updateBusinessEmployeeGroup(
        this.overlayData.data.businessId,
        value,
        this.overlayData.data.groupId,
      ).pipe(
        tap((updatedEmployeeGroup) => {
          this.dialogRef.close(updatedEmployeeGroup);
        }),
      );
    }

    employeeGroup.pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.cdr.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  public get nameErrorMessage(): string | null {
    const control = this.form.get('name');
    if (control.errors?.required || control.errors?.pattern) {
      return this.translationService.translate('common.forms.validations.required');
    }
    if (control.errors?.groupIsNotUnique) {
      return this.translationService.translate('form.create_form.employee.validation.already_exists', {
        groupName: control.value,
      });
    }

    return null;
  }

  private get ValueChanges$() {
    return merge(
      this.form.valueChanges,
      this.form.controls.acls.valueChanges,
    );
  }

  private get dirty() : boolean {
    return this.form.dirty || this.form.controls.acls.dirty;
  }
}
