import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThirdPartyFormServiceInterface, InfoBoxSettingsInterface, InfoBoxSettingsInFormInterface } from '../../../../../kit/third-party-form';

const qrConnected: InfoBoxSettingsInterface = require('./qr-config-connected.json');
const qrPreview: InfoBoxSettingsInterface = require('./qr-config-preview.json');
const qrDownload: InfoBoxSettingsInterface = require('./qr-config-download.json');
const qrPrint: InfoBoxSettingsInterface = require('./qr-config-print.json');

export class ThirdPartyFormQrConfigStubService implements ThirdPartyFormServiceInterface {

  constructor(private testCategoryName: string) {}

  requestInitialForm(): Observable<InfoBoxSettingsInFormInterface> {
    
    return this.ret(qrConnected);
  }

  executeAction(action: string, data: {}): Observable<InfoBoxSettingsInFormInterface> {
    
    const ret = this.ret;
    if (action === 'close') {
      return ret(qrConnected);
    }
    if (action === 'download') {
      return ret(qrDownload);
    }
    if (action === 'print') {
      return ret(qrPrint);
    }
    if (action === 'preview') {
      return ret(qrPreview);
    }
    console.error(data);
    throw new Error('Invalid data!');
  }

  getActionUrl(action: string): string {
    return '/';
  }

  prepareUrl(url: string): string {
    return url;
  }

  allowCustomActions(): boolean {
    return false;
  }

  allowDownload(): boolean {
    return true;
  }

  private readonly ret: (data: any) => Observable<InfoBoxSettingsInFormInterface> = (data: any) => {
    return timer(1200).pipe(map(a => data));
  }
}
