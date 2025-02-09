import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThirdPartyFormServiceInterface, InfoBoxSettingsInterface, InfoBoxSettingsInFormInterface } from '../../../../../kit/third-party-form';

const twilioConnections: InfoBoxSettingsInterface = require('./twilio-connections.json');
const twilioConnectionsAdd: InfoBoxSettingsInterface = require('./twilio-connections-add.json');

const twilioConnected: InfoBoxSettingsInterface = require('./twilio-connected.json');
const twilioConnectedRemoveConfirm: InfoBoxSettingsInterface = require('./twilio-connected-remove-confirm.json');
const twilioConnectedAfterRemove: InfoBoxSettingsInterface = require('./twilio-connected-after-remove.json');
const twilioConnectedAdd: InfoBoxSettingsInterface = require('./twilio-connected-add.json');
const twilioConnectedAddSearch: InfoBoxSettingsInterface = require('./twilio-connected-add-search.json');
const twilioDisconnected: InfoBoxSettingsInterface = require('./twilio-disconnected.json');

export class ThirdPartyFormTwilioStubService implements ThirdPartyFormServiceInterface {

  constructor(private testCategoryName: string) {}

  requestInitialForm(): Observable<InfoBoxSettingsInFormInterface> {
    
    const isTwilioTest: boolean = this.testCategoryName === 'testTwilioCategory';
    if (isTwilioTest) {
      return this.ret(twilioConnections);
    }
    throw new Error('Invalid data!');
  }

  executeAction(action: string, data: {}): Observable<InfoBoxSettingsInFormInterface> {
    
    const ret = this.ret;
    const isTwilioTest: boolean = this.testCategoryName === 'testTwilioCategory';
    if (isTwilioTest && action === 'reset-credentials') {
      return ret(twilioDisconnected);
    } else if (isTwilioTest && action === 'start') {
      return ret(twilioConnected);
    } else if (isTwilioTest && action === 'form' && data['id']) {
      return ret(twilioConnected);
    } else if (isTwilioTest && action === 'form' && !data['id']) {
      return ret(twilioConnectionsAdd);
    } else if (isTwilioTest && data['apiUrl'] && data['apiUrl'].indexOf('twillio-phone-remove-confirm') > 0) {
      return ret(twilioDisconnected);
    } else if (isTwilioTest && action === 'remove-number') {
      return ret(twilioConnectedRemoveConfirm);
    } else if (isTwilioTest && action === 'twillio-phone-remove') {
      return ret(twilioConnectedAfterRemove);
    } else if (isTwilioTest && action === 'add-number') {
      return ret(twilioConnectedAdd);
    } else if (isTwilioTest && action === 'search-numbers') {
      return ret(twilioConnectedAddSearch);
    } else if (isTwilioTest) {
      console.error(data);
      throw new Error('Invalid data!');
    }
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
