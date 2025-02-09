import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { InfoBoxSettingsInterface } from '../../../../../kit/third-party-generator/src/interfaces';

const amazonConnected: InfoBoxSettingsInterface = require('./amazon-connected.json');
const amazonDisconnected: InfoBoxSettingsInterface = require('./amazon-disconnected.json');

const dhlConnected: InfoBoxSettingsInterface = require('./dhl-connected.json');
const dhlDisconnected: InfoBoxSettingsInterface = require('./dhl-disconnected.json');

const twilioConnected: InfoBoxSettingsInterface = require('./twilio-connected.json');
const twilioConnectedRemoveConfirm: InfoBoxSettingsInterface = require('./twilio-connected-remove-confirm.json');
const twilioConnectedAfterRemove: InfoBoxSettingsInterface = require('./twilio-connected-after-remove.json');
const twilioConnectedAdd: InfoBoxSettingsInterface = require('./twilio-connected-add.json');
const twilioConnectedAddSearch: InfoBoxSettingsInterface = require('./twilio-connected-add-search.json');
const twilioDisconnected: InfoBoxSettingsInterface = require('./twilio-disconnected.json');

@Injectable()
export class ThirdPartyGeneratorStubService {
  constructor() {}

  execThirdPartyApi(baseApiUrl: string, data: {}): Observable<InfoBoxSettingsInterface> {
    

    const ret: (data: any) => Observable<InfoBoxSettingsInterface> = (data: any) => {
      return timer(1200).pipe(map(a => data));
    };

    const isAmazonTest: boolean = data['authStateData'] && data['authStateData']['integrationCategory'] === 'testAmazonCategory';
    if (isAmazonTest && data['actionId'] === 'disconnect-app') {
      return ret(amazonDisconnected);
    } else if (isAmazonTest) {
      return ret(amazonConnected);
    }

    const isDhlTest: boolean = data['authStateData'] && data['authStateData']['integrationCategory'] === 'testDhlCategory';
    if (isDhlTest && data['actionId'] === 'disconnect-app') {
      return ret(dhlDisconnected);
    } else if (isDhlTest) {
      return ret(dhlConnected);
    }

    const isTwilioTest: boolean = data['authStateData'] && data['authStateData']['integrationCategory'] === 'testTwilioCategory';
    if (isTwilioTest && data['actionId'] === 'disconnect-app') {
      return ret(twilioDisconnected);
    } else if (isTwilioTest && data['apiUrl'] && data['apiUrl'].indexOf('twillio-phone-remove-confirm') > 0) {
      return ret(twilioConnectedRemoveConfirm);
    } else if (isTwilioTest && data['actionId'] === 'twillio-phone-remove') {
      return ret(twilioConnectedAfterRemove);
    } else if (isTwilioTest && data['actionId'] === 'twillio-numbers-add') {
      return ret(twilioConnectedAdd);
    } else if (isTwilioTest && data['actionId'] === 'twillio-numbers-search') {
      return ret(twilioConnectedAddSearch);
    } else if (isTwilioTest) {
      return ret(twilioConnected);
    }
  }
}
