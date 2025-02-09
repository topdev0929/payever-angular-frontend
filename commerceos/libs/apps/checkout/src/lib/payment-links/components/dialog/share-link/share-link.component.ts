import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { BusinessInterface, EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { ThirdPartyFormServiceInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

import { IntegrationConnectInfoInterface } from '../../../../interfaces';
import { ApiService, StorageService, ThirdPartyInternalFormService } from '../../../../services';
import { PaymentLinksApiService } from '../../../services';

import { PANELS } from './share-link.constant';

@Component({
  selector: 'pe-share-link',
  templateUrl: './share-link.component.html',
  styleUrls: ['./share-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class ShareLinkComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  public copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sendToDevice$ = new Subject();

  private qrIntegrationsInstalled$ = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
    filter(v => !!v),
    switchMap(checkout => this.storageService.getCheckoutEnabledIntegrations(checkout._id)),
    filter(v => !!v),
    take(1),
    map(v => v.includes('qr')),
  )

  readonly panels$ = this.qrIntegrationsInstalled$.pipe(
    map(value => value
      ? PANELS
      : PANELS.filter(i => i.key !== 'QR')
    ),
  );

  emailForm = this.formBuilder.group({
    email: [null, [Validators.required, Validators.email]],
  });

  showErrors = false;
  isLoading = false;
  thirdPartyService: ThirdPartyFormServiceInterface = null;
  integration: IntegrationConnectInfoInterface = null;
  paymentLinkId = this.overlayData.paymentLinkId;
  link = this.overlayData.link;


  get checkoutUuid(): string {
    return /\/checkout\/(.+)\//.exec(document.URL)[1];
  }

  get emailErrorMessage() {
    return this.emailForm.get('email').hasError('required')
      ? 'paymentLinks.shareLink.email.errors.required'
      : 'paymentLinks.shareLink.email.errors.pattern';
  }

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: {
      paymentLinkId: string,
      onSave$: Observable<void>,
      onCancel$: Observable<void>,
      close: () => void,
      link: string,
    },
    private apiService: ApiService,
    private paymentLinksApiService: PaymentLinksApiService,
    private clipboardService: ClipboardService,
    private translateService: TranslateService,
    private httpClient: HttpClient,
    private readonly formBuilder: FormBuilder,
    private snackBarService: SnackbarService,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    const getConnectIntegrationInfo$ = this.apiService.getConnectIntegrationInfo(this.businessUuid, 'qr').pipe(
      tap((integration) => {
        this.integration = integration;

        this.thirdPartyService = new ThirdPartyInternalFormService(
          this.env, this.httpClient,
          this.businessUuid,
          this.businessData.name,
          null,
          this.paymentLinkId,
          this.integration,
          this.link,
        );
        this.cdr.detectChanges();
      }),
    );

    const onClose$ = merge(
      this.overlayData.onCancel$,
      this.overlayData.onSave$,
    ).pipe(
      tap(() => {
        this.overlayData.close();
      }),
    );

    const sendToDevice$ = this.sendToDevice$.pipe(
      switchMap(() => {
        this.isLoading = true;
        this.cdr.detectChanges();
        const subject = this.translateService.translate('paymentLinks.shareLink.sendToDevice.subject');

        return this.paymentLinksApiService.sendToDevice(this.paymentLinkId, {
          email: this.emailForm.get('email').value,
          subject,
          message: `${subject}: ${this.link}`,
        });
      }),
      tap(() => {
        this.snackBarService.toggle(true, {
          content: this.translateService.translate('paymentLinks.shareLink.email.successMessage'),
          duration: 5000,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      }),
      catchError(() => (this.isLoading = false, EMPTY)),
    );

    merge(
      onClose$,
      getConnectIntegrationInfo$,
      sendToDevice$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();


  }

  sendMail() {
    if (this.emailForm.valid) {
      this.sendToDevice$.next();
    } else {
      this.showErrors = true;
    }
  }

  onCopyClick() {
    this.clipboardService.copyFromContent(this.link);
    this.copied$.next(true);
    setTimeout(() => this.copied$.next(false), 2000);
  }

}
