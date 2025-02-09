import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AbstractComponent } from '../components/abstract';
import { closeConfirmationQueryParam } from '../misc/constants';

@Injectable()
export class InfoBoxService extends AbstractComponent {
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
 constructor(
   private translateService: TranslateService,
   private overlayService: PeOverlayWidgetService,
   private router: Router,
   private activatedRoute: ActivatedRoute,
 ) {
   super();
 }
  openModal(data, theme, updateMethod) {
    const config: PeOverlayConfig = {
      data: { data: data.data, theme },
      headerConfig: {
        title: data.name,
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
        theme,
      },
      backdropClick: () => {
        this.onCloseWindow();
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
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return  {
      component,
      data,
      name: detail.itemName,
    };
  }

  onCloseWindow() {
    const queryParams = {};
    queryParams[closeConfirmationQueryParam] = true;
    this.router.navigate([], {queryParams, relativeTo: this.activatedRoute});
  }
}
