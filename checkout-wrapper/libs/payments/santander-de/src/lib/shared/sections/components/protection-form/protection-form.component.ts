import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, ReplaySubject, merge } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { DialogService } from '@pe/checkout/dialog';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, ParamsState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PaymentHelperService, PeCurrencyPipe } from '@pe/checkout/utils';

import { ProtectionFormValue, RatesDataInterface } from '../../../types';

import { cpiValidator } from './cpi.validator';
import { InsurancePackageDialogComponent } from './package-dialog/package-dialog.component';
import { SantanderDePosProtectionService } from './protection-form.service';


@Component({
  selector: 'protection-form',
  templateUrl: './protection-form.component.html',
  styleUrls: ['./protection-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeCurrencyPipe,
    SantanderDePosProtectionService,
  ],
})
export class ProtectionFormComponent
  extends CompositeForm<ProtectionFormValue>
  implements OnInit {

  @SelectSnapshot(ParamsState.merchantMode) private merchantMode!: boolean;

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  dataForwardingRsvEnabled$ = new BehaviorSubject<boolean>(false);

  private santanderDePosProtectionService = this.injector.get(SantanderDePosProtectionService);
  private paymentHelperService = this.injector.get(PaymentHelperService);
  private cdr = this.injector.get(ChangeDetectorRef);
  private dialogService = this.injector.get(DialogService);
  private sanitizer = this.injector.get(DomSanitizer);

  @Input() embedMode = false;

  @Input() set ratesData(data: RatesDataInterface) {
    data && this.santanderDePosProtectionService.initRatesData(data);
    !!this.formGroup.get('creditProtectionInsurance').value && this.formGroup
      .get('_cpiCreditDurationInMonths')
      .setValue(this.santanderDePosProtectionService.cpiRate?.duration);
    this.updateTranslations$.next();
  }

  public readonly formGroup = this.fb.group({
    _yes: [null],
    _no: [null],
    creditProtectionInsurance: [null, Validators.required],
    _cpiCreditDurationInMonths: [null],
    dataForwardingRsv: [
      {
        value: null,
        disabled: true,
      },
      Validators.requiredTrue,
    ],
  },
    {
      validators: [cpiValidator],
    });

  public get insuranceData() {
    return this.santanderDePosProtectionService.insuranceData;
  }

  private updateTranslations$ = new ReplaySubject(1);
  public readonly translations$ = this.updateTranslations$.pipe(
    map(() => ({
      _yes: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.yes:`,
      _no: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.no:`,
      dataForwardingRsv: this.sanitizer.bypassSecurityTrustHtml(this.merchantMode
        ? this.insuranceData?.dataForwardingRsv?.merchant
        : this.insuranceData?.dataForwardingRsv?.selfService),
      subhead: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.subhead:${this.santanderDePosProtectionService.insuranceData?.insuranceValue ?? ''}:customString:`,
    }))
  );

  ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.IconLoader?.loadIcons([
      'set'],
      null,
      this.customElementService.shadowRoot);

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['shield-checked'],
      null,
      this.customElementService.shadowRoot
    );

    const toggleYes$ = this.formGroup.get('_yes').valueChanges.pipe(
      startWith(this.formGroup.get('_yes').value),
      tap((value) => {
        if (value) {
          this.formGroup.get('creditProtectionInsurance').setValue(true);
          this.formGroup.get('_no').setValue(false, { emitEvent: false });
          this.formGroup
            .get('_cpiCreditDurationInMonths')
            .setValue(this.santanderDePosProtectionService.cpiRate?.duration);


          !this.embedMode
            && this.santanderDePosProtectionService.cpiRate?.totalCreditCost
            && this.paymentHelperService.totalAmount$.next(
              this.santanderDePosProtectionService.cpiRate.totalCreditCost
            );

          return;
        }

        this.formGroup.get('creditProtectionInsurance').setValue(null);
      }),
    );
    const toggleNo$ = this.formGroup.get('_no').valueChanges.pipe(
      startWith(this.formGroup.get('_no').value),
      tap((value) => {
        if (value) {
          this.formGroup.get('_yes').setValue(false, { emitEvent: false });
          this.formGroup.get('creditProtectionInsurance').setValue(false);
          this.formGroup.get('_cpiCreditDurationInMonths').setValue(null);

          !this.embedMode
            && this.santanderDePosProtectionService.rate?.totalCreditCost
            && this.paymentHelperService.totalAmount$.next(
              this.santanderDePosProtectionService.rate.totalCreditCost
            );
        }
      }),
    );

    const creditProtectionInsurance$ = this.formGroup.get('creditProtectionInsurance').valueChanges.pipe(
      startWith(this.formGroup.get('creditProtectionInsurance').value, this.formGroup.get('_yes').value),
      tap((value) => {
        value
          ? this.formGroup.get('dataForwardingRsv').enable()
          : this.formGroup.get('dataForwardingRsv').disable();
      })
    );

    merge(
      toggleYes$,
      toggleNo$,
      creditProtectionInsurance$,
    ).pipe(
      tap(() => this.cdr.markForCheck()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onClickSubhead(event: Event) {
    if (event
      && event.composedPath
      && event.composedPath()[0]
      && (event.composedPath()[0] as any)['nodeName'] === 'A'
    ) {
      event.preventDefault();
      this.dialogService.open(InsurancePackageDialogComponent, null, {
        informationPackage: this.insuranceData.informationPackage,
      });
    }
  }
}
