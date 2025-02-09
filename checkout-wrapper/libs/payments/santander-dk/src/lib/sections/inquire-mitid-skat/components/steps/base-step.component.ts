import { ChangeDetectorRef, Directive, OnInit, inject, isDevMode } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { CompositeForm } from '@pe/checkout/forms';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalNavigateData, ExternalRedirectStorage } from '@pe/checkout/storage';
import { AuthSelectors, FlowState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum, SectionType } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { SantanderDkFlowService } from '../../../../shared';

export interface StepTranslations {
  login: string;
  status: {
    text: string;
    title: string;
  };
  actions: {
    login: string;
    continue: string;
  };
}

export enum StepType {
  MitId = 'mitid',
  Skat = 'skat',
  BankConsent = 'bankConsent',
}

interface FormRedirectData {
  postUrl: string;
  postValues: Record<string, string>[];
}

@Directive()
export abstract class BaseStepComponent extends CompositeForm<any> implements OnInit {

  @SelectSnapshot(FlowState.flow) protected flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) protected paymentMethod: PaymentMethodEnum;

  public formRedirectData: FormRedirectData;
  public readonly abstract translations: StepTranslations;
  public abstract navigate(): void;
  public abstract storage(): void;
  public abstract pass(): void;
  protected readonly abstract stepType: StepType;

  protected store = inject(Store);
  protected env = inject(PE_ENV);
  protected cdr = inject(ChangeDetectorRef);
  protected localeConstantsService = inject(LocaleConstantsService);
  protected externalNavigateData = inject(ExternalNavigateData);
  protected externalRedirectStorage = inject(ExternalRedirectStorage);
  protected flowService = inject(SantanderDkFlowService);
  private topLocationService = inject(TopLocationService);
  private trackingService = inject(TrackingService);

  public navigationError: string;
  public isStepActive$: Observable<boolean>;
  public isReady$: Observable<boolean>;

  protected get wrapperUrl(): string {
    const checkoutWrapper = isDevMode() ? 'http://localhost:8090' : this.env.frontend.checkoutWrapper;
    const url = new URL(`${checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/${this.flow.id}/redirect-out-of-iframe`);
    url.searchParams
      .set('type', this.stepType);

    url.searchParams
      .set('step', SectionType.Payment);

    if (window.origin !== this.env.frontend.checkoutWrapper || window.self !== window.top) {
      url.searchParams.set('guest_token', this.store.selectSnapshot(AuthSelectors.accessToken));
    }

    return url.toString();
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.externalNavigateData.getValue(this.flow.id, 'type') === this.stepType) {
      const failed = this.externalNavigateData.getValue(this.flow.id, 'failed');
      const error = this.externalNavigateData.getValue(this.flow.id, 'error');
      this.navigationError = error;

      !failed && !error && this.storage();
    }
    this.trackingService.doEmitCustomEvent(this.flow.id, this.paymentMethod, this.stepType);
  }

  protected redirect(url: string): Observable<boolean> {
    // Why we have to save whole flow at server? Because of Safari.
    // When it's inside iframe it has isolated local storage.
    // So when we redirect back to page, we loose all information. As result we have to temporary keep it on server.
    // Also it's needed when we start payment at one domain
    // (and wrapper is not iframe but web component) and continue at checkout payever domain (after redirect back)

    return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
      tap(() => {
        this.topLocationService.href = url;
      }),
      catchError((err) => {
        this.navigationError = err.message;
        this.cdr.markForCheck();

        return of(null);
      }),
      map(() => true),
    );
  }

  protected extractErrorMessage(err: any): string {
    return Array.isArray(err.raw?.error?.message)
      ? err.raw?.error?.message?.join(', ')
      : err.raw?.error?.message;
  }
}
