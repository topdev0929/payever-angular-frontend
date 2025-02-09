import { NgxZendeskWebwidgetConfig } from './ngx-zendesk-webwidget';

window['zESettings'] = {
  webWidget: {
    position: { horizontal: 'left', vertical: 'bottom' },
  },
};

export class ZendeskConfig extends NgxZendeskWebwidgetConfig {
  accountUrl = 'payeverorg.zendesk.com';
  beforePageLoad(zE: any) {
    zE.setLocale('de');
    zE.hide();
  }
}
