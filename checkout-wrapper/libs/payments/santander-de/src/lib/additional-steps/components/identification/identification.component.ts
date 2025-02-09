import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError, delayWhen, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { DialogService } from '@pe/checkout/dialog';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { SantanderDeFlowService } from '../../../shared/services';
import { WebIDIdentMode } from '../../../shared/types';
import { INPUTS } from '../../injection-token.constants';
import { ConfirmDialogComponent, ConfirmDialogOverlayData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'santander-de-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentificationComponent implements OnInit {
  private inputs = inject(INPUTS);
  private cdr = inject(ChangeDetectorRef);
  private customElementService = inject(CustomElementService);
  private destroy$ = inject(PeDestroyService);
  private flowService = inject(SantanderDeFlowService);
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);
  private topLocationService = inject(TopLocationService);
  private externalRedirectStorage = inject(ExternalRedirectStorage);

  public translations = {
    headerCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.headerCard.title:`,
    headerCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.headerCard.subtitle:`,
    descriptionCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.descriptionCard.title:`,
    descriptionCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.descriptionCard.subtitle:`,
    skipText: $localize`:@@santander-de.inquiry.additionalSteps.identification.skip.text:`,
  };

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  public error: HttpErrorResponse;
  
  public actions: {
    type: WebIDIdentMode,
    title: string,
    subtitle: string,
    icon: string,
  }[] = [
      {
        type: WebIDIdentMode.VideoIdent,
        title: $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.videoChat.title:`,
        subtitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.videoChat.subtitle:`,
        icon: '#icon-video-chat-28',
      },
      {
        type: WebIDIdentMode.PayIdent,
        title: $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.kontoIdent.title:`,
        subtitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.kontoIdent.subtitle:`,
        icon: '#icon-account-identification-28',
      },
    ];

  private startIdentification$ = new Subject<WebIDIdentMode>();
  public isLoading$ = new BehaviorSubject<WebIDIdentMode>(null);

  onClicked(type: WebIDIdentMode) {
    if (this.isLoading$.getValue()) { return }
    const overlayData: ConfirmDialogOverlayData = {
      requirementsTitle: $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirementsTitle:`,
      requirements: type === WebIDIdentMode.PayIdent
        ? [
          $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirements.webcam:`,
          $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirements.onlineBanking:`,
        ]
        : [
          $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirements.passport:`,
          $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirements.connection:`,
          $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.requirements.webcamAndMic:`,
        ],
      header: {
        title: type === WebIDIdentMode.VideoIdent
          ? $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.videoChat.title:`
          : $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.kontoIdent.title:`,
        subtitle: type === WebIDIdentMode.VideoIdent
          ? $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.videoChat.headerSubtitle:`
          : $localize`:@@santander-de.inquiry.additionalSteps.identification.actions.kontoIdent.headerSubtitle:`,
      },
      confirmBtnText: $localize`:@@santander-de.inquiry.additionalSteps.identification.confirmDialog.confirm:`,
      actions: {
        confirm: () => {
          this.startIdentification$.next(type);
        },
      },
    };
    this.dialogService.open(ConfirmDialogComponent, null, overlayData);
  }


  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['account-identification-28', 'video-chat-28', 'register-done-32', 'close-16'],
      null,
      this.customElementService.shadowRoot
    );

    this.startIdentification$.pipe(
      takeUntil(this.destroy$),
      tap((identMode) => {
        this.isLoading$.next(identMode);
      }),
      switchMap(identMode => this.flowService.getWebIDIdentificationURL(identMode).pipe(
        catchError((err) => {
          this.handleError(err);

          return of(null);
        })
      )),
      map(res => res?.paymentDetails?.customerSigningLink),
      delayWhen(res => res ? this.saveDataBeforeRedirect() : of(res)),
      tap((customerSigningLink) => {
        this.isLoading$.next(null);
        customerSigningLink && (this.topLocationService.href = customerSigningLink);
      }),
    ).subscribe();
  }

  skip() {
    this.inputs.skip();
  }

  getErorText(err: HttpErrorResponse){
    return `${(<any>err)?.code || ''} ${err?.message || 'HttpFailure'}`;
  }

  private handleError(err: HttpErrorResponse) {
    this.error = err;
    this.cdr.detectChanges();
  }

  private saveDataBeforeRedirect() {
    // Why we have to save whole flow at server?
    // Because of Safari. When it's inside iframe it has isolated local storage.
    // So when we redirect back to page, we loose all information. As result we have to temporary keep it on server.
    // Also it's needed when we start payment at one domain (and wrapper is not iframe but web component)
    // and continue at checkout payever domain (after redirect back)
    return this.apiService._getFlow(this.flow.id).pipe(
      switchMap(flow => this.externalRedirectStorage.saveDataBeforeRedirect(flow).pipe(
        catchError((err) => {
          this.handleError(err);

          return of(null);
        })
      ))
    );
  }
}
