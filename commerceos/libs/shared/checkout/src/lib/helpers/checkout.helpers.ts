import { FlowBodyInterface } from '../interfaces';

export const createFlowBody = (channelSet: string, merchantMode: any, generatePaymentCode: any): FlowBodyInterface => {
  return {
    x_frame_host: getXFrameHost(),
    shop_url: getAppUrl(),
    channel_set_id: channelSet,
    pos_merchant_mode: merchantMode || String(sessionStorage.getItem('enableMerchantMode')) === 'true',
    cart: [],
    generatePaymentCode,
  };
};

export const getXFrameHost = (): string => {
  return window.location.ancestorOrigins?.length
    ? window.location.ancestorOrigins[0]
    : window.location.origin;
};

const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getAppUrl = (): string => {
  const pathSegments: string[] = location.pathname.split('/');
  const xFrameHost = getXFrameHost();

  if (
    pathSegments.length > 1 &&
    pathSegments[pathSegments.length - 2] === 'product' &&
    UUID_REGEXP.test(pathSegments[pathSegments.length - 1])
  ) {
    pathSegments.splice(-2);
  } else if (pathSegments[pathSegments.length - 1] === 'cart') {
    pathSegments.pop();
  }

  return xFrameHost + pathSegments.join('/');
};
