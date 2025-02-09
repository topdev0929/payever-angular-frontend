import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PE_ENV } from '@pe/common';
import { InfoBoxSettingsInFormInterface, ThirdPartyFormServiceInterface } from '@pe/forms';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_POS_HOST } from '../../constants';

import { PeQrPrintFileType, PeQrPrintFormData, PeQrPrintOperation, PeQrPrintOverlayData } from './qr-print.interface';
import { QrPrintThirdPartyFormMock } from './qr-print.third-party-form.mock';

@Injectable()
export class PeQrPrintThirdPartyFormService implements ThirdPartyFormServiceInterface {

  private readonly mock = new QrPrintThirdPartyFormMock(this.env.connect?.qr);

  get url() {
    return `${this.overlayData?.terminal?.accessConfig.internalDomain}.${this.posHost}`;
  }

  constructor(
    @Inject(PE_ENV) private env: any,
    @Optional() @Inject(PE_OVERLAY_DATA) private  overlayData: PeQrPrintOverlayData,
    @Inject(PEB_POS_HOST) public posHost: string,
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

  wrapFormData(formData: any): any {
    return formData;
  }
}
