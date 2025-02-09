export const DEV_STAGE: string = 'development';
export const SHOWROOM_STAGE: string = 'showroom';
export const STAGING_STAGE: string = 'stage';
export const SANDBOX_STAGE: string = 'sandbox';
export const LIVE_STAGE: string = 'live';
export const UNKNOWN_STAGE: string = 'unknown';

export const SHOWROOM_STAGE_PATTERN: RegExp = /^(showroom)(\d*)(.payever.de)$/i;
export const SHOWROOM_NK_PATTERN: RegExp = /^(nk-)(\d*)(.payever.de)$/i;
export const SHOWROOM_APP_PATTERN: RegExp = /^([\w-]*)(-sr.payever.de)$/i;
export const SHOWROOM_DOMAINS: string[] = ['shopware.devpayever.com'];

// Used in modules: bugsnag, full-story, i18n
export function getReleaseStage(): string {
  const hostname: string = window.location.hostname;
  if (hostname.indexOf('local') !== -1 || hostname.endsWith('.dev')) {
    return DEV_STAGE;
  } else if (
    hostname.match(SHOWROOM_STAGE_PATTERN) ||
    hostname.match(SHOWROOM_NK_PATTERN) ||
    hostname.match(SHOWROOM_APP_PATTERN) ||
    SHOWROOM_DOMAINS.indexOf(hostname) >= 0
  ) {
    return SHOWROOM_STAGE;
  } else if (hostname.startsWith(STAGING_STAGE) || hostname.indexOf('devpayever') !== -1 || hostname === 'ng-kit.payever.de') {
    // TODO: Plugins on *.devpayever.com can be stage or sandbox
    return STAGING_STAGE;
  } else if (hostname.startsWith(SANDBOX_STAGE)) {
    return SANDBOX_STAGE;
  } else if (hostname === 'mein.payever.de' || hostname.indexOf('payever') === -1) {
    // NOTE: Live plugins can be deployed on arbitrary domains but not *payever*
    return LIVE_STAGE;
  } else {
    return UNKNOWN_STAGE;
  }
}
