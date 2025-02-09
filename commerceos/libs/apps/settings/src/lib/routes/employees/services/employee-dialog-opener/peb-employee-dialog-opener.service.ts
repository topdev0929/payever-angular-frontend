import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog/dialog-ref';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap, take } from 'rxjs/operators';

import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { BusinessEmployeeInterface } from '../../../../misc/interfaces';
import { BusinessEnvService } from '../../../../services';
import { NewEmployeeDialogComponent, NewEmployeeGroupComponent } from '../../components';
import { CATEGORY, PARAM } from '../../constants';
import { CreateEmployeeDialogDataInterface, ICreateEmployeeGroupDialogDataInterface } from '../../interfaces';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';

@Injectable()
export class PebEmployeeDialogOpenerService {
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  private formDirty$ = new BehaviorSubject<boolean>(false);

  constructor(
    private dialog: MatDialog,
    private envService: BusinessEnvService,
    private translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmScreenService: ConfirmScreenService
  ) { }

  openNewEmployeeDialog(groupId) {
    const data: CreateEmployeeDialogDataInterface = {
      groupId,
      businessId: this.envService.businessUuid,
      dirty$: this.formDirty$,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_employee.title.add',
      NewEmployeeDialogComponent
    );

    return this.overlayService.open(config);
  }

  openUpdateEmployeeDialog(editedEmployee: BusinessEmployeeInterface) {
    const data: CreateEmployeeDialogDataInterface = {
      businessId: this.envService.businessUuid,
      employee: editedEmployee,
      dirty$: this.formDirty$,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_employee.title.edit',
      NewEmployeeDialogComponent
    );

    return this.overlayService.open(config);
  }

  openNewEmployeeGroupDialog() {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      businessId: this.envService.businessUuid,
      dirty$: this.formDirty$,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_group.title.add',
      NewEmployeeGroupComponent
    );

    return this.overlayService.open(config);
  }

  openEditEmployeeGroupDialog(groupId: string, group: IGroupItemInterface) {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      groupId,
      group,
      businessId: this.envService.businessUuid,
      dirty$: this.formDirty$,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_group.title.permissions',
      NewEmployeeGroupComponent
    );

    return this.overlayService.open(config);
  }

  onCloseWindow() {
    this.formDirty$.getValue() ?
      this.showConfirmationDialog() : this.dialogRef.close();
  }

  showConfirmationDialog = () => {
    const headings: Headings = {
      confirmBtnText: this.translateService.translate('dialogs.window_exit.confirm'),
      declineBtnText: this.translateService.translate('dialogs.window_exit.decline'),
      subtitle: this.translateService.translate('dialogs.window_exit.label'),
      title: this.translateService.translate('dialogs.window_exit.title'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      take(1),
      switchMap((dismiss: boolean | undefined) => {
        if (dismiss === true && this.dialogRef) {
          this.dialogRef.close();
        }

        return this.route.queryParams.pipe(
          tap((res) => {
            const queryParams = {};
            res[PARAM] && (queryParams[PARAM] = res[PARAM]);
            res[CATEGORY] && (queryParams[CATEGORY] = res[CATEGORY]);

            this.router.navigate([], { queryParams });
          }),
        );
      }),
    ).subscribe();
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
