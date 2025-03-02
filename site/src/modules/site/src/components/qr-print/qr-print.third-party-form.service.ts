import { Inject, Injectable, Optional } from '@angular/core';
import { EMPTY, forkJoin, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mapTo, tap } from 'rxjs/operators';

import { InfoBoxSettingsInFormInterface } from '@pe/forms/third-party-form/interfaces';
import { PE_ENV } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_SITE_HOST } from '../../constants';
import { QrPrintThirdPartyFormMock } from './qr-print.third-party-form.mock';
import { PeQrPrintFileType, PeQrPrintFormData, PeQrPrintOperation, PeQrPrintOverlayData } from './qr-print.interface';

@Injectable()
export class PeQrPrintThirdPartyFormService {

  private readonly mock = new QrPrintThirdPartyFormMock(this.env.connect?.qr);

  private get url() {
    return `${this.overlayData?.site?.accessConfig.internalDomain}.${this.siteHost}`;
  }

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private env: any,
    @Optional() @Inject(PE_OVERLAY_DATA) private  overlayData: PeQrPrintOverlayData,
    @Inject(PEB_SITE_HOST) public siteHost: string,
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
