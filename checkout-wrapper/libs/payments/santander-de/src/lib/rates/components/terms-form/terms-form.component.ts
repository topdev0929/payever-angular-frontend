import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { defer } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { DialogService } from '@pe/checkout/dialog';
import { DefaultDialogComponent } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';
import { PeDestroyService } from '@pe/destroy';

import { SandtanderDocs, TermsFormValue } from '../../../shared';

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class TermsFormComponent extends CompositeForm<TermsFormValue> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  private env = this.injector.get(PE_ENV);
  private dialogService = this.injector.get(DialogService);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  public readonly formGroup = this.fb.group({
    credit_protection_insurance: [false],
    _agreement_for_data_processing_and_transfer: [null, Validators.requiredTrue],
    credit_accepts_requests_to_credit_agencies: [null],
    allow_promo_email: [null],
    allow_promo_phone: [null],
    allow_promo_letter: [null],
    allow_promo_others: [null],
  });

  private readonly dataProcessingTransferAgreement = this.makeAssetsUrl(SandtanderDocs.ProcessingAndTransfer);
  private readonly promoAgreement = this.makeAssetsUrl(SandtanderDocs.Advertising);
  private readonly privacyStatement = this.makeAssetsUrl(SandtanderDocs.Datenschutzhinweise);
  private readonly productSpecificDataProtectionInfo = this.makeAssetsUrl(SandtanderDocs.SCBGudula);
  private readonly schufaAgreement = this.makeAssetsUrl(SandtanderDocs.ZurDaten);

  public readonly translations = {
    _borrowerAgreeToBeAdvised: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerAgreeToBeAdvised.label:`,
    _agreement_for_data_processing_and_transfer: $localize`:@@santander-de.inquiry.form._agreement_for_data_processing_and_transfer.label:`,
    credit_accepts_requests_to_credit_agencies: $localize`:@@santander-de.inquiry.form.credit_accepts_requests_to_credit_agencies.label:${this.schufaAgreement}:fileUrl:`,
    productSpecificDataProtectionInfo: $localize`:@@santander-de.inquiry.product_specific_data_protection_info:${this.productSpecificDataProtectionInfo}:fileUrl:`,
    allowDataProcessingAndTransferFull: $localize`:@@santander-de.inquiry.form.allow_data_processing_and_transfer_full:${this.dataProcessingTransferAgreement}:fileUrl:`,
    legalPromoShort: $localize`:@@santander-de.inquiry.legal_text_promo.short:${this.privacyStatement}:fileUrlPrivacy:`,
  };

  public showCpiLegalText$ = defer(() => this.formGroup.get('credit_protection_insurance').valueChanges.pipe(
    startWith(this.formGroup.get('credit_protection_insurance').value),
  ));

  ngOnInit(): void {
    super.ngOnInit();

    const toggleAgreement$ = this.formGroup.get('credit_protection_insurance').valueChanges.pipe(
      startWith(this.formGroup.get('credit_protection_insurance').value),
      tap((value) => {
        value
          ? this.formGroup.get('_agreement_for_data_processing_and_transfer').enable()
          : this.formGroup.get('_agreement_for_data_processing_and_transfer').disable();
      }),
    );

    toggleAgreement$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onPromoTextClicked(event: MouseEvent): void {
    const elem: HTMLAnchorElement =
      event?.composedPath && (event.composedPath()[0] as any);
    if (
      elem &&
      String(elem.nodeName).toUpperCase() === 'A' &&
      elem.href === elem.baseURI
    ) {
      event.preventDefault();
      this.openPromoDialog();
    }
  }

  private makeAssetsUrl(fileName: string): string {
    return this.env.custom.cdn + '/docs/santander-de/' + fileName;
  }

  private openPromoDialog(): void {
    this.dialogService.open(DefaultDialogComponent, null, {
      flowId: this.flow.id,
      title: $localize `:@@santander-de.inquiry.legal_promo_conditions.more_info.title:`,
      text: $localize `:@@santander-de.inquiry.legal_promo_conditions.more_info.text:${this.promoAgreement}:fileUrl:`,
    });
  }
}
