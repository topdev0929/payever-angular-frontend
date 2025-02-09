import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { duration } from 'moment';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { catchError, map, skip, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_SAVE, PeOverlayRef } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

import { TransactionRetentionSetting } from '../../../../misc/interfaces/business-details.interface';
import { ApiService } from '../../../../services';

import { transactionRetentionOptions } from './transaction-retention.constants';

@Component({
  selector: 'pe-edit-transaction-retention-setting',
  templateUrl: './edit-transaction-retention-setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class EditTransactionRetentionSettingComponent implements OnInit {

  constructor(
    @Inject(PE_OVERLAY_SAVE) private overlaySaveSubject: BehaviorSubject<any>,
    private peOverlayRef: PeOverlayRef,
    private translateService: TranslateService,
    private apiService: ApiService,
    private snackBarService: SnackbarService,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
  ) { }

  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  private data$ = new BehaviorSubject<TransactionRetentionSetting>(null)
  public isLoading$ = this.data$.pipe(
    tap((data) => {
      data && this.initiateFrom(data);
    }),
    map(v => !v),
  )

  ngOnInit(): void {
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => { this.onSave(); }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.apiService.getTransactionsRetentionSetting(this.businessId).pipe(
      catchError((err) => {
        this.showError(err.message);
        this.peOverlayRef.close();

        return EMPTY;
      }),
      take(1),
      tap((value) => {
        this.data$.next(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public formGroup = this.fb.group({
    failedTransactionsRetentionPeriod: [this.durationIsoString(5, 'years')],
    transactionsRetentionPeriod: [this.durationIsoString(5, 'years')],
  })

  public options: {
    label: string,
    value: string,
  }[] = transactionRetentionOptions.map(option => ({
    label: this.constructLabel(option),
    value: this.durationIsoString(option.value, option.unit),
  }))

  private durationIsoString(...params: Parameters<typeof duration>) {
    return duration(...params).toISOString();
  }

  private constructLabel(option: typeof transactionRetentionOptions[number]) {
    const translationKey = `info_boxes.panels.business_details.menu_list.archive.${option.unit}`;
    const unitLabel = this.translateService.hasTranslation(translationKey)
      ? this.translateService.translate(translationKey)
      : option.unit;

    return `${option.value} ${unitLabel}`;
  }

  private onSave() {
    if (this.formGroup.valid) {
      this.apiService.patchTransactionsRetentionSetting(this.businessId, this.formGroup.value).pipe(
        tap(() => { this.peOverlayRef.close(); }),
        catchError((err) => {
          this.showError(err.message);

          return of(null);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private initiateFrom(data: TransactionRetentionSetting) {
    this.formGroup.patchValue(
      data && Object.entries(data).reduce((acc, [key, value]) => {
        if (!value) {
          return acc;
        }
        acc[key] = value;

        return acc;
      }, {})
    );
  }
}
