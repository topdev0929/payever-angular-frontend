import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayRef } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { SecurityQuestionInterface } from '../../misc/interfaces';
import { ApiService } from '../../services';

@Injectable()
export class EditSecurityQuestionService {
  questions$ = new BehaviorSubject<string[]>([]);
  selectedQuestion$ = new BehaviorSubject<string>('');
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    private peOverlayRef: PeOverlayRef,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {
    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();
  }

  initQuestions(): void {
    this.questions$.next(this.overlayData.data?.securityQuestions ?? []);
    this.selectedQuestion$.next(this.overlayData.data?.selectedQuestion ?? '');
  }

  saveAndClose(values: SecurityQuestionInterface): void {
    this.setLoading(true);
    this.apiService.setSecurityQuestions(values).pipe(
      take(1),
      tap(() => {
        this.snackbarService.toggle(true, {
          content: this.translateService.translate('info_boxes.panels.general.menu_list.security_question.success'),
          duration: 2500,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
        });
        this.peOverlayRef.close({ data: values });
      }),
      finalize(() => this.setLoading(false))
    ).subscribe();
  }

  setLoading(value: boolean) {
    this.isLoading$.next(value);
  }
}
