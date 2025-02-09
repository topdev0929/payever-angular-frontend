import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Observer, of } from 'rxjs';

import { SettingsState } from '@pe/checkout/store';
import { CheckoutSettingsInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { DEFAULT_DATE_INTERNAL_FORMAT } from '../constants';
import {
  RiskSessionInterface,
  ThreatMetrixDataInterface,
  ThreatMetrixFlowDetailsInterface,
} from '../types';

import { BaseThreatMetrixService } from './base-threat-metrix.service';
import { TransformDateService } from './transform-date.service';

const DEFAULT_ORIG_ID = 'cx8xec1a';


@Injectable({
  providedIn: 'root',
})
export class ThreatMetrixService extends BaseThreatMetrixService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private store: Store,
    private httpClient: HttpClient,
  ) {
    super();
  }

  // To avoid huge module import:
  private transformDateService: TransformDateService = new TransformDateService();

  nodeInitFor(
    flowId: string,
    connectionId: string,
    paymentMethod: PaymentMethodEnum,
  ): Observable<boolean> {
    if (!this.isPaymentAllowed(paymentMethod)) {
      return of(true);
    }

    if (this.isInitializing(flowId, paymentMethod)) {
      return this.initialized$(flowId, paymentMethod);
    }
    if (!this.isReady(flowId, paymentMethod)) {
      this.setInitializing(flowId, paymentMethod, true);

      return new Observable((observer: Observer<boolean>) => {
        this.httpClient.post<RiskSessionInterface>(this.getNodeRiskSessionIdRequestUrl(connectionId, paymentMethod), {})
          .subscribe(
            (session: RiskSessionInterface) => {
              this.addScript(
                session.riskSessionId,
                paymentMethod,
                session.provider.script,
                (result) => {
                  observer.next(result);
                  observer.complete();
                },
              );
              this.rememberRiskId(flowId, paymentMethod, session.riskSessionId);
              this.setReady(flowId, paymentMethod, true);
              this.setInitializing(flowId, paymentMethod, false);
            },
            () => {
              observer.next(false);
              observer.complete();

              this.setInitializing(flowId, paymentMethod, false);
            }
          );
      });
    }

    return of(true);
  }

  onSubmitPayment(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    data: ThreatMetrixFlowDetailsInterface,
  ): Observable<void> {
    const riskId = this.getLastRiskId(flowId, paymentMethod);

    const settings = this.store.selectSnapshot(SettingsState.settings);
    const params: ThreatMetrixDataInterface = this.flowDetailsToData(data, settings, riskId);

    return this.httpClient.post<void>(this.getOnPostPaymentRequestUrl(flowId, paymentMethod), params);
  }

  private addScript(
    sessionId: string,
    paymentMethod: PaymentMethodEnum,
    scriptText: string,
    cb: (r: boolean) => void,
  ): void {
    const domain = 'plr.scb-payments.net';
    const origId = this.env.config.tmetrixOrigId || DEFAULT_ORIG_ID;
    const initProfile = () => {
      (window as any).satmrfu.profile(domain, origId, sessionId);
    };

    const scriptId = `${paymentMethod}-satmrfu`;

    if (document.getElementById(scriptId)) {
      initProfile();
      cb(true);

      return;
    }

    const script = this.createScript(
      scriptId,
      scriptText,
      initProfile,
      cb,
    );

    document.head.appendChild(script);
    if (scriptText) {
      initProfile();
      cb(true);
    }
  }

  private createScript(
    scriptId: string,
    scriptText: string,
    initProfile: () => void,
    cb: (r: boolean) => void,
  ): HTMLScriptElement {
    const script = scriptText
      ? this.createDynamicScript(scriptId, scriptText)
      : this.createStaticScript(scriptId);

    script.onload = () => {
      initProfile();
      cb(true);
    };

    script.onerror = () => {
      cb(false);
    };

    return script;
  }

  private createDynamicScript(
    scriptId: string,
    scriptText: string,
  ): HTMLScriptElement {
    const template = document.createElement('template');
    template.innerHTML = scriptText;
    const scriptContent = (template.content.firstChild as HTMLScriptElement).innerHTML;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = scriptContent;
    script.id = scriptId;

    return script;
  }

  private createStaticScript(
    scriptId: string,
  ): HTMLScriptElement {
    const scriptUrl = `${this.env.custom.cdn}/js/a8c545jixc.js`;

    const script: HTMLScriptElement = document.createElement('script');
    script.id = scriptId;
    script.src = scriptUrl;

    return script;
  }

  private getNodeRiskSessionIdRequestUrl(connectionId: string, paymentMethod: PaymentMethodEnum): string {
    if (!this.isPaymentAllowed(paymentMethod)) {
      throw new Error(`Payment method ${paymentMethod} is not allowed for ThreatMetrixService`);
    }

    return `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-risk-session-id`;
  }

  private getOnPostPaymentRequestUrl(flowId: string, paymentMethod: PaymentMethodEnum): string {
    if (!this.isPaymentAllowed(paymentMethod)) {
      throw new Error(`Payment method ${paymentMethod} is not allowed for ThreatMetrixService`);
    }

    return `${this.apiRestV3UrlPrefix}checkout/flow/${flowId}/threat-metrix/session-data`;
  }

  private flowDetailsToData(
    details: ThreatMetrixFlowDetailsInterface,
    settings: CheckoutSettingsInterface,
    riskSessionId: string,
  ): ThreatMetrixDataInterface {
    const birthday: Date = details.birthday
      ? this.transformDateService.parse(details.birthday, DEFAULT_DATE_INTERNAL_FORMAT)
      : null;
    const env = this.env.config.env;

    return {
      account_email: details.email || '',
      account_first_name: details.firstName || '',
      account_last_name: details.lastName || '',
      account_date_of_birth: birthday ? this.transformDateService.format(birthday, 'en', 'YYYYMMDD') : '',
      transaction_id: details.reference || '',
      transaction_amount: details.total || 0,
      account_telephone: details.phone || '',
      condition_attrib_2: settings.channelType || '',
      condition_attrib_3: env === 'live' ? 'production' : (env || ''),
      custom_count_2: details.shippingAsBillingAddress ? '1' : '0',
      custom_count_3: String(details.selectedRateMonths || ''),
      unencrypted_condition_attrib_2: navigator.userAgent || '',
      session_id: riskSessionId,
    };
  }

  private get apiRestV3UrlPrefix(): string {
    return `${this.env.backend.payments}/api/rest/v3/`;
  }
}
