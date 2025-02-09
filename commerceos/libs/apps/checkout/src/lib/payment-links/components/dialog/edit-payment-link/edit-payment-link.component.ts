import { trigger, transition, style, animate } from '@angular/animations';
import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import moment, { duration } from 'moment';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, Observable, Subject, iif, of, merge, EMPTY } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { BusinessInterface, EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

import { GetPaymentLinkResponse, PaymentLinksInterface } from '../../../interfaces';
import { Action, PaymentLinksApiService, PaymentLinksListService } from '../../../services';

import { SOCIAl_MEDIA_OPTIONS, LinkActionsEnum } from './edit-payment-link.constant';

type FieldLabel = {
  label: string,
  value: string,
}
@Component({
  selector: 'pe-edit-payment-link',
  templateUrl: './edit-payment-link.component.html',
  styleUrls: ['./edit-payment-link.component.scss'],
  providers: [PeDestroyService],
  animations: [
    trigger(
      'fadeInAnimation',
      [
        transition('void => *', [
          style({ opacity: 0 }),
          animate(500, style({ opacity: 1 })),
        ]),
      ],
    ),
  ],
})
export class EditPaymentLinkComponent {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;

  public copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private data$ = new BehaviorSubject<GetPaymentLinkResponse>(null)
  public isLoading$ = this.data$.pipe(
    tap((data) => {
      data && this.initiateFrom(data);
    }),
    map(v => !v),
  )


  constructor(
    private fb: FormBuilder,
    private paymentLinksApiService: PaymentLinksApiService,
    private destroy$: PeDestroyService,
    private clipboardService: ClipboardService,
    private listService: PaymentLinksListService,
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private snackBarService: SnackbarService,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: {
      paymentLinkId: string,
      onSave$: Observable<void>,
      onCancel$: Observable<void>,
      close: () => void,
      openAction$: Subject<Action>
    },
  ) {
    const { paymentLinkId } = this.overlayData;
    const loading$ = iif(() => !!paymentLinkId,
      this.paymentLinksApiService.getLink(paymentLinkId),
      this.paymentLinksApiService.createLink({}),
    ).pipe(
      catchError((err) => {
        this.showError(err.message);
        this.overlayData.close();

        return EMPTY;
      }),
      take(1),
      tap((data) => {
        this.data$.next(data);
      }),
    );

    const onCancel$ = this.overlayData.onCancel$.pipe(
      switchMap(() => {
        const config: Headings = {
          title: this.translateService.translate(`paymentLinks.dialog.confirm.${paymentLinkId ? 'edit' : 'create'}.title`),
          subtitle: this.translateService.translate(`paymentLinks.dialog.confirm.${paymentLinkId ? 'edit' : 'create'}.subtitle`),
          confirmBtnText: this.translateService.translate('warning-modal.actions.yes'),
          declineBtnText: this.translateService.translate('warning-modal.actions.no'),
        };

        return this.confirmScreenService.show(config, true);
      }),
      filter(confirm => confirm),
      switchMap(() => this.overlayData.paymentLinkId
        ? of(null)
        : this.paymentLinksApiService.deleteLink(this.id).pipe(
          catchError((err) => {
            this.showError(err.message);

            return of(true);
          }),
        )),
      tap((hasError) => {
        !hasError && this.overlayData.close();
      }),

    );

    const onSave$ = this.overlayData.onSave$.pipe(
      mergeMap(() => this.paymentLinksApiService.patchLink(this.id, this.preparePaymentLink()).pipe(
        catchError((err) => {
          this.showError(err.message);

          return of(null);
        }),
      )),
      filter(noErrors => noErrors),
      tap(() => {
        this.overlayData.close();
        this.listService.resetItems();
      }),
    );

    merge(
      loading$,
      onCancel$,
      onSave$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  readonly socialMediaOptions = SOCIAl_MEDIA_OPTIONS.filter(item => !item.disabled);

  formGroup = this.fb.group({
    language: 'auto',
    linkType: 'reusable',
    expiresAt: 'never',
    id: null,
  })

  options: { [key: string]: FieldLabel[] } = {
    language: [
      {
        label: 'Auto detect',
        value: 'auto',
      },
    ],
    linkType: [
      {
        label: 'Single use',
        value: 'singleUse',
      },
      {
        label: 'Reusable',
        value: 'reusable',
      },
    ],
    expiresAt: [
      {
        label: 'Never',
        value: 'never',
      },
      {
        label: '24 Hours',
        value: moment.duration(1, 'days').toISOString(),
      },
      {
        label: '48 Hours',
        value: moment.duration(2, 'days').toISOString(),
      },
      {
        label: '1 Week',
        value: moment.duration(1, 'weeks').toISOString(),
      },
    ],
  }

  get id() {
    return this.formGroup.get('id').value;
  }

  link() {
    const redirectLinkPrefix = `${this.envConfig.backend.checkout}/api/payment/link`;

    return `${redirectLinkPrefix}/${this.id}`.replace(/\//g, '/&ZeroWidthSpace;');
  }

  onCopyClick() {
    this.clipboardService.copyFromContent(this.link().replace(/&ZeroWidthSpace;/g, ''));
    this.copied$.next(true);
    setTimeout(() => this.copied$.next(false), 2000);
  }

  shareTo(target) {
    switch (target.payload) {
      case LinkActionsEnum.prefill:
        this.overlayData.openAction$.next({
          paymentLinkId: this.formGroup.get('id').value,
          type: target.payload,
          businessName: this.businessData.name,
          businessUuid: this.businessUuid,
        });
        break;
    }
  }

  private initiateFrom(data: GetPaymentLinkResponse) {
    this.formGroup.patchValue({
      linkType: data.reusable ? 'reusable' : 'singleUse',
      expiresAt: typeof data?.expiresAt === 'string'
        ? duration(
          Math.abs(Math.round(
            moment(data.createdAt).diff(data.expiresAt, 'days', true)
          ))
          , 'days'
        ).toISOString()
        : 'never',
      id: data.id,
    });
  }

  private preparePaymentLink(): Partial<PaymentLinksInterface> {
    const { value } = this.formGroup;

    return {
      expiresAt: value.expiresAt === 'never'
        ? null
        : moment(this.data$.value.createdAt).add(value.expiresAt),
      reusable: value.linkType === 'reusable',
    };
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
