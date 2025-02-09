import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog/dialog-ref';
import { ActivatedRoute, Router } from '@angular/router';
import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { closeConfirmationQueryParam } from '../../../../misc/constants';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { BusinessEnvService } from '../../../../services';
import { NewEmployeeDialogComponent } from '../../components/new-employee-dialog/new-employee-dialog.component';
import { NewEmployeeGroupComponent } from '../../components/new-employee-group/new-employee-group.component';
import { CreateEmployeeDialogDataInterface, ICreateEmployeeGroupDialogDataInterface } from '../../interfaces';

@Injectable()
export class PebEmployeeDialogOpenerService {
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  constructor(
    private dialog: MatDialog,
    private envService: BusinessEnvService,
    private translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  openNewEmployeeDialog(groupId) {
    const data: CreateEmployeeDialogDataInterface = {
      groupId,
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData$?.themeSettings?.theme] || AppThemeEnum.default,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(data, 'dialogs.new_employee.title.add', NewEmployeeDialogComponent);

    return this.overlayService.open(config);
  }

  openUpdateEmployeeDialog(editedEmployee: BusinessEmployeeInterface) {
    const data: CreateEmployeeDialogDataInterface = {
      businessId: this.envService.businessUuid,
      employee: editedEmployee,
      theme: AppThemeEnum[this.envService.businessData$?.themeSettings?.theme] || AppThemeEnum.default,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(data, 'dialogs.new_employee.title.edit', NewEmployeeDialogComponent);

    return this.overlayService.open(config);
  }

  openNewEmployeeGroupDialog() {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData$?.themeSettings?.theme] || AppThemeEnum.default,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(data, 'dialogs.new_group.title.add', NewEmployeeGroupComponent);

    return this.overlayService.open(config);
  }

  openEditEmployeeGroupDialog(groupId, group) {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      groupId,
      group,
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData$?.themeSettings?.theme] || AppThemeEnum.default,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(data, 'dialogs.new_group.title.edit', NewEmployeeGroupComponent);

    return this.overlayService.open(config);
  }

  onCloseWindow() {
    const queryParams = {};
    queryParams[closeConfirmationQueryParam] = true;
    this.router.navigate([], {queryParams, relativeTo: this.route, queryParamsHandling: 'merge'});
  }

  getOverlayConfig(data, title, component) {
    return {
      panelClass: 'new-employee-dialog',
      data: { data },
      headerConfig: {
        title: this.translateService.translate(title),
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.onCloseWindow();
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: data.theme,
      },
      backdropClick: () => {
        this.onCloseWindow();
      },
      component,
    };
  }

  private openDialog<T>(data: CreateEmployeeDialogDataInterface): MatDialogRef<NewEmployeeDialogComponent, T> {
    return this.dialog.open(NewEmployeeDialogComponent, {
      hasBackdrop: false,
      panelClass: ['settings-dialog', 'settings-dialog-without-padding'],
      data,
    });
  }
}
