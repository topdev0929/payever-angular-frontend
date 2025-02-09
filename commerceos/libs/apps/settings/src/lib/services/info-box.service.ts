import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';


@Injectable()
export class InfoBoxService implements OnDestroy {

  dialogRef: PeOverlayRef;
  isCloseSettings = false;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private messageBus: MessageBus,
    private overlayService: PeOverlayWidgetService,
    private confirmScreenService: ConfirmScreenService,
  ) {
  }

  openModal(data, updateMethod, closeDialog = () => {}) {
    const config: PeOverlayConfig = {
      data: { data: data.data },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.showConfirmationDialog(closeDialog);
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.showConfirmationDialog(closeDialog);
      },
      component: data.component,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((res) => {
          if (res) {
            updateMethod(res.data);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return {
      component,
      data,
      name: detail.itemName,
    };
  }

  showConfirmationDialog(closeDialog) {
    const headings: Headings = {
      title: this.translateService.translate('dialogs.window_exit.title'),
      subtitle: this.translateService.translate('dialogs.window_exit.label'),
      declineBtnText: this.translateService.translate('dialogs.window_exit.decline'),
      confirmBtnText: this.translateService.translate('dialogs.window_exit.confirm'),
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          closeDialog();
          this.dialogRef.close();
          this.closeSettings(false);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  closeSettings(isCloseSettings) {
    if (isCloseSettings) {
      this.messageBus.emit('settings.close.app', '');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
