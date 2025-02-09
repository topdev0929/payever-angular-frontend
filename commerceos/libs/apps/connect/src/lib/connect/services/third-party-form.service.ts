import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { forEach } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface as EnvInterface, PE_ENV } from '@pe/common';
import {
  InfoBoxSettingsInterface,
  ThirdPartyFormServiceInterface,
  InfoBoxSettingsInfoBoxTypeInterface,
  PeListCellType,
  PeListCellValueInterface,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';

import { AuthTokenInterface, BusinessInterface, IntegrationInfoWithStatusInterface } from '../../shared';
import { ApmService } from '@elastic/apm-rum-angular';

export class ThirdPartyFormService implements ThirdPartyFormServiceInterface {
  apiKeys: AuthTokenInterface[] = null;
  apiKeysEditorEnabled$: Observable<boolean> = null;
  onboardingFormEnabled$: Observable<boolean> = null;
  private apiKeysEditorEnabledSubject = new BehaviorSubject(false);
  private onboardingFormEnabledSubject = new BehaviorSubject(false);

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private readonly apmService: ApmService,
    private peAuthService: PeAuthService,
    private httpClient: HttpClient,
    private businessId: string,
    private integration: IntegrationInfoWithStatusInterface,
  ) {
    this.apiKeysEditorEnabled$ = this.apiKeysEditorEnabledSubject.asObservable();
    this.onboardingFormEnabled$ = this.onboardingFormEnabledSubject.asObservable();
  }

  private checkIframeValues(settings: InfoBoxSettingsInfoBoxTypeInterface) {
    try {
      settings.content.accordion.find(panel =>
        panel.data?.find((list) => {
          const iframe = list?.find(datum =>
            (datum.type as PeListCellType) === PeListCellType.Iframe) as PeListCellValueInterface;

          if (iframe) {
            try {
              const url = new URL(iframe.value);

              if (url.origin !== window.location.origin) {
                const payload = {
                  settings,
                  message: 'Third party iframe is not from the same origin',
                  iframeOrigin: url.origin,
                  windowOrigin: window.location.origin,
                };

                this.apmService.apm.captureError(
                  new Error('Third party iframe is not from the same origin \n' + JSON.stringify(payload)),
                );
              }
            } catch (err) {
              this.apmService.apm.captureError(err);

              throw new err;
            }
          }
        })
      );

      return settings;
    } catch {}
  }

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.runRequest(this.integration.connect.formAction.initEndpoint).pipe(
      map((data) => {
        this.updateSections(data.form as InfoBoxSettingsInfoBoxTypeInterface);

        // TODO: Remove after error has been found out
        this.checkIframeValues(data.form as InfoBoxSettingsInfoBoxTypeInterface);

        return data;
      }),
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.runRequest(this.integration.connect.formAction.actionEndpoint, { action: action }, data).pipe(
      map((data) => {
        this.updateSections(data.form as InfoBoxSettingsInfoBoxTypeInterface);

        return data;
      }),
    );
  }

  getActionUrl(action: string): string {
    return this.makeUrl(this.integration.connect.formAction.actionEndpoint, { action: action });
  }

  prepareUrl(url: string): string {
    return url.replace('{redirectUrl}', encodeURIComponent(window.location.href));
  }

  allowCustomActions(): boolean {
    return true;
  }

  allowDownload(): boolean {
    return false;
  }

  setApiKeys(keys: AuthTokenInterface[]): void {
    this.apiKeys = keys;
  }

  wrapFormData(formData: any): any {
    if (this.integration?.connect?.dynamicForm) {
      return {
        paymentMethodSettings: {
          ...formData,
        },
      };
    }

    return formData;
  }

  private makeUrl(endpoint: string, replace: {} = {}): string {
    endpoint = endpoint.replace('{businessId}', this.businessId);
    forEach(replace, (value: string, key: string) => endpoint = endpoint.replace(`{${key}}`, value));

    return `${this.integration.connect.url}${endpoint}`;
  }

  private runRequest(
    endpoint: string,
    replace: {} = {},
    data: {} = {},
  ): Observable<{ form: InfoBoxSettingsInterface }> {
    const token = this.peAuthService.token;

    if (this.integration.connect.sendApiKeys) {
      data['apiKeys'] = this.apiKeys || [];
    }

    if (this.integration?.paymentMethod) {
      data['paymentMethod'] = this.integration.paymentMethod;
    }

    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(this.makeUrl(endpoint, replace), data, {
      headers: { authorization: `Bearer ${token}` },
    });
  }

  private updateSections(data: InfoBoxSettingsInfoBoxTypeInterface): void {
    this.apiKeysEditorEnabledSubject.next(!!data?.apiKeysEditorEnabled);
    this.onboardingFormEnabledSubject.next(!!data?.onboardingFormEnabled);
  }
}

export class ThirdPartyInternalFormService implements ThirdPartyFormServiceInterface {
  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private httpClient: HttpClient,
    private mediaService: MediaService,
    private translateService: TranslateService,
    private business: BusinessInterface,
    private integration: IntegrationInfoWithStatusInterface,
  ) {}

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    const endpoint = this.integration.extension.formAction.endpoint.split('{businessId}').join(this.business._id);
    const url = this.integration.extension.url + endpoint;
    let data = {};
    if (this.integration.name === 'qr') {
      data = {
        url: 'https://commerceos.payever.org/', // TODO Not good. Hardcode should be removed.
        businessName: this.business.name,
        avatarUrl: this.mediaService.getMediaUrl(this.business.logo, 'images'),
        businessId: this.business._id,
        // payeverLogo: true,
        // wording: this.translateService.translate('qr.previewImageTitle')
      };
    }

    return this.httpClient.request<{ form: InfoBoxSettingsInterface }>(
      this.integration.extension.formAction.method || 'POST',
      url,
      { body: data },
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return null;
  }

  getActionUrl(action: string): string {
    return null;
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return true;
  }

  allowDownload(): boolean {
    return true;
  }

  wrapFormData(formData: any): any {
    return formData;
  }
}

export class OldThirdPartyFormService implements ThirdPartyFormServiceInterface {
  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private httpClient: HttpClient,
    private businessId: string,
    private integration: IntegrationInfoWithStatusInterface,
  ) {}

  get domain(): string {
    return this.envConfig.thirdParty.communications;
  }

  requestInitialForm(): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(
      `${this.domain}/api/business/${this.businessId}/integration/${this.integration.name}/form`,
      {},
    );
  }

  executeAction(action: string, data: {}): Observable<{ form: InfoBoxSettingsInterface }> {
    return this.httpClient.post<{ form: InfoBoxSettingsInterface }>(this.getActionUrl(action), data);
  }

  getActionUrl(action: string): string {
    return `${this.domain}/api/business/${this.businessId}/integration/${this.integration.name}/action/${action}`;
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return false;
  }

  wrapFormData(formData: any): any {
    return formData;
  }
}
