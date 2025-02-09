import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil, tap } from 'rxjs/operators';

import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeWidgetService } from '../infrastructure';

@Component({
  selector: 'peb-statistics-overlay',
  templateUrl: './statistics-overlay.component.html',
  styleUrls: ['./statistics-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsOverlayComponent implements OnInit, DoCheck, OnDestroy {
  edit = false;
  private backButton: HTMLCollectionOf<Element>;

  readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
  ) {
    this.overlayConfig.onSave$
      .pipe(
        tap((onSave) => {
          if (widgetService.currentPage === 0) {
            setTimeout(() => {
              overlayConfig.backBtnTitle = translateService.translate('statistics.action.cancel');
            });
          }
          if (this.widgetService.currentPage === 0 && onSave) {
            this.widgetService.viewType = widgetService.widgetType.DetailedNumbers;
          }
          if (this.widgetService.currentPage === 0 && onSave === false) {
            this.showConfirmationDialog(
              this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
            ).pipe(
              tap(() => {
                this.widgetService.overlayRef.close();
              }),
              takeUntil(this.destroy$),
              ).subscribe();
          }
          if (onSave === true && this.widgetService.currentPage < 3) {
            if (widgetService?.selectedApp) {
              this.widgetService.currentPage += 1;
              this.overlayConfig.onSaveSubject$.next(null);
            }
          }
          if (onSave === false && this.widgetService.currentPage > 0) {
            this.widgetService.currentPage -= 1;
            this.overlayConfig.onSaveSubject$.next(null);
          }
          if (widgetService.currentPage === 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.done');
            });
          }
          if (widgetService.currentPage < 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.next');
            });
          }
        }),
        delay(100),
        tap(() => {
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }


  private showConfirmationDialog(subtitle: string) {
    const headings: Headings = {
      title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
      subtitle,
      declineBtnText: this.translateService.translate('statistics.action.no'),
      confirmBtnText: this.translateService.translate('statistics.action.yes'),
    };

    return this.confirmScreenService.show(headings, true).pipe(
      filter(val => !!val),
      takeUntil(this.destroy$),
    );
  }

  ngOnInit(): void {
    const element = this.widgetService.overlayRef.getOverlayElement();
    this.backButton = element.getElementsByClassName('overlay-widget__back');
  }

  ngDoCheck(): void {
    this.backButton[0].innerHTML =
      this.translateService.translate(`statistics.action.${!this.widgetService.currentPage ? 'cancel' : 'back'}`);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
