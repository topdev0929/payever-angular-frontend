import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { InfoBoxSettingsInFormInterface } from '@pe/forms/third-party-form/interfaces';
import { PE_ENV } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_SHOP_HOST } from '../../constants';
import { PeQrPrintFileType, PeQrPrintFormData, PeQrPrintOperation } from './qr-print.interface';
import { QrPrintThirdPartyFormMock } from './qr-print.third-party-form.mock';

@Injectable()
export class PeQrPrintThirdPartyFormService {

  private readonly mock = new QrPrintThirdPartyFormMock(this.env.connect?.qr);

  get url() {
    return `${this.overlayData?.shop?.accessConfig.internalDomain}.${this.shopHost}`;
  }

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private env: any,
    @Optional() @Inject(PE_OVERLAY_DATA) private overlayData: any,
    @Inject(PEB_SHOP_HOST) public shopHost: string,
  ) {
  }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return false;
  }

  executeAction(action: PeQrPrintOperation, data: PeQrPrintFormData): Observable<InfoBoxSettingsInFormInterface> {
    return of(this.mock.generateQrPrintForm(data, action));
  }

  getActionUrl(action: string): string {
    return null;
  }

  prepareUrl(url: string): string {
    return url;
  }

  requestInitialForm(): Observable<InfoBoxSettingsInFormInterface> {
    return of(this.mock.generateQrPrintForm({ type: PeQrPrintFileType.Pdf, url: `https://${this.url}` }));
  }
}
