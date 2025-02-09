function isExpiredToken(token) {
  if (token) {
    const payload = token.split('.')[1];
    const exp = JSON.parse(window.atob(payload)).exp;
    const isExpired = exp <= Number((Date.now() / 1000).toFixed());
    if (isExpired) {
      localStorage.removeItem('pe_guest_token');

      return true;
    }
  } else {
    localStorage.removeItem('pe_guest_token');
  }
}

function getUrlHostname(backendCommerceos) {
  const url = new URL(backendCommerceos).hostname;

  return url.hostname;
}

function addClassesToCollection(collection, classList) {
  Array.from(collection).forEach((item) => {
    item.classList.add(...classList);
  });
}

const _queries = {
  Mobile: () => window.matchMedia('(min-width: 0)').matches,
  Tablet: () => window.matchMedia('(min-width: 744px)').matches,
  Desktop: () => window.matchMedia('(min-width: 1024px)').matches,
};

function matchedType() {
  return Object.entries(_queries)
    .map(([key, value]) => [key, value()])
    .filter(([, value]) => value)
    .map(([key]) => key)
    .slice(-1)[0];
}

function matchStyle(stylePrefix, styleSuffix, matchedScreenType, styles) {
  const screenTypeIxd = Object.keys(_queries).findIndex((s) => s === matchedScreenType);

  const matched = Object.keys(_queries)
    .slice(screenTypeIxd)
    .map((type) => styles[`${stylePrefix}${type}${styleSuffix}`])
    .find((style) => !!style);

  return typeof matched === 'number' ? `${matched}px` : matched;
}

function checkMarginLimit(matchedScreenType, margin, styles) {
  if (!styles) {
    return 0;
  }

  const businessHeaderHeight = matchStyle('businessHeader', ' Height', matchedScreenType, styles) || 0;
  const businessLogoHeight = matchStyle('businessLogo', 'Height', matchedScreenType, styles) || 0;

  const maxMargin = businessHeaderHeight - businessLogoHeight;

  return margin > maxMargin ? maxMargin : margin;
}

const flowLoader = {
    flowId: null,
    flowData: null,
    lastError: null,
    successCallback: null,
    errorCallback: null,
  };
  window['pe_pageFlowLoader'] = flowLoader;

function initMerchantSkeletonStyle(data, backendCommerceos = peBackendCheckout) {
  const shadowRoot = document.getElementById('pe-checkout-skeleton-wrapper')?.shadowRoot;

  const styles = data.styles || {};
  const { merchantMode, clientMode } = window['peCheckoutParams'] || {};
  const isMerchantMode =
    merchantMode || (backendCommerceos && getUrlHostname(backendCommerceos) === window.location.hostname);

  if (!(isMerchantMode || clientMode)) {
    const style = document.createElement('style');
    const matchedScreenType = matchedType();
    const businessHeaderHeight = matchStyle('businessHeader', 'Height', matchedScreenType, styles);

    const bh = styles.active ? businessHeaderHeight : '55px';

    if (styles.active && data.logo) {
      const defaultStyles = {
        width: 'auto',
        height: `${parseInt(bh, 10) - 10 < 0 ? 0 : parseInt(bh, 10) - 10}px`,
        marginTop: '0',
        marginRight: '0',
        marginBottom: '0',
        marginLeft: '0',
      };

      if (flowLoader?.flowData && flowLoader.flowData.channel !== 'pos') {
        const root = shadowRoot ?? document.body;
        Array.from(root.querySelectorAll('.pe-index-page-skeleton-html')).forEach(function (peElem) {
          const businessHeader = peElem.getElementsByClassName('business-header')[0];
          const businessLogoWrapper = businessHeader.getElementsByClassName('logo-wrapper')[0];
          const logoImg = document.createElement('img');
          logoImg.classList = 'business-logo';
          logoImg.width = defaultStyles.width;
          logoImg.height = defaultStyles.height;

          if (!data.logo.startsWith('://') && data.logo.includes('://')) {
            // If full url
            logoImg.setAttribute('src', data.logo);
          } else {
            logoImg.setAttribute('src', peBackendCustomStorage + '/images/' + data.logo);
          }

          businessLogoWrapper.appendChild(logoImg);

          const businessLogoWidth = matchStyle('businessLogo', 'Width', matchedScreenType, styles);
          const businessLogoHeight = matchStyle('businessLogo', 'Height', matchedScreenType, styles);
          const businessLogoAlignment = matchStyle('businessLogo', 'Alignment', matchedScreenType, styles);
          const businessLogoPaddingTop = matchStyle('businessLogo', 'PaddingTop', matchedScreenType, styles);
          const businessLogoPaddingRight = matchStyle('businessLogo', 'PaddingRight', matchedScreenType, styles);
          const businessLogoPaddingBottom = matchStyle('businessLogo', 'PaddingBottom', matchedScreenType, styles);
          const businessLogoPaddingLeft = matchStyle('businessLogo', 'PaddingLeft', matchedScreenType, styles);

          const isDefault = businessLogoWidth == '0' && businessLogoHeight == '0';

          style.innerHTML += `
            .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header {
              align-items: ${isDefault ? 'center' : 'start'}
            }
            .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header .logo-wrapper {
              display: flex;
              padding: 0 15px;
              justify-content: ${businessLogoAlignment || 'left'};
            }
            .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header .business-logo {
              width: ${businessLogoWidth || defaultStyles.width};
              height: ${businessLogoHeight ?? defaultStyles.height};
              margin-top: ${checkMarginLimit(
                matchedScreenType,
                businessLogoPaddingTop || defaultStyles.marginTop,
                styles
              )}px;
              margin-right: ${businessLogoPaddingRight || defaultStyles.marginRight}px;
              margin-bottom: ${checkMarginLimit(
                matchedScreenType,
                businessLogoPaddingBottom || defaultStyles.marginBottom,
                styles
              )}px;
              margin-left: ${businessLogoPaddingLeft || defaultStyles.marginLeft}px;
            }
          `;
        });

        style.innerHTML += `
          .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header {
            border-color: ${styles.businessHeaderBorderColor} !important;
            background: ${styles.businessHeaderBackgroundColor} !important;
          }
        `;
      }

      style.innerHTML += `
        .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header {
          display: ${isMerchantMode || clientMode ? 'none' : 'grid'} !important;
          height: ${bh}px;
        }
        .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.business-header .business-logo {
          display: block;
        }
        .pe-checkout-bootstrap .ui-layout-app .layout-app-header + .layout-app-body {
          top: ${bh}px;
        }
      `;

      style.innerHTML += `
        .pe-index-page-skeleton-html.ui-layout-app .layout-app-header.light-grey {
          background: ${styles.pageBackgroundColor} !important;
          border-color: ${styles.pageLineColor} !important;
        }
        .pe-index-page-skeleton-html.ui-layout-app .ui-layout-content .ui-layout-content-main.light-grey {
          border-color: ${styles.pageLineColor} !important;
          background: ${styles.pageBackgroundColor} !important;
        }
      `;
    }

    shadowRoot ? shadowRoot.appendChild(style) : document.head.appendChild(style);
  }
  // Now we finally can show skeleton
  const stylex = document.createElement('style');
  stylex.innerHTML = `
    .pe-checkout-bootstrap .pe-index-page-skeleton-html .layout-app-header.default-header {
      display: ${merchantMode || clientMode || !styles.active ? 'block' : 'none'} !important;
      height: 55px;
    }
    .pe-index-page-skeleton-html {
      display: block !important;
    }
  `;
  shadowRoot ? shadowRoot.appendChild(stylex) : document.head.appendChild(stylex);
}

if (!window.peFrontendCheckoutWrapperPassed) {
  window.peFrontendCheckoutWrapperPassed = true;
  // Different paths due to production structure being different than development

  function loadSkeletonTemplate(url, id) {
    if (document.getElementById(id)) {
      // If rempalte already added to index.html during the build
      const div = document.createElement('div');
      div.setAttribute('id', 'pe-index-page-skeleton-content');
      div.setAttribute('style', 'display: none');
      div.innerHTML = document.getElementById(id).innerHTML;
      document.getElementsByTagName('body')[0].appendChild(div);
      initSkeletonFromPageBody();
    } else {
      fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          const divd = document.createElement('div');
          divd.innerHTML = html;
          document.getElementsByTagName('body')[0].appendChild(divd);

          const divx = document.createElement('div');
          divx.setAttribute('id', 'pe-index-page-skeleton-content');
          divx.setAttribute('style', 'display: none');
          divx.innerHTML = document.getElementById(id).innerHTML;
          document.getElementsByTagName('body')[0].appendChild(divx);

          initSkeletonFromPageBody();
        })
        .catch(err => console.error(`LoadSkeletonTemplate error:n ${JSON.stringify(err)}`));
    }
  }

  function initSkeletonFromPageBody() {
    const div = document.getElementById('pe-index-page-skeleton-content');
    const skeleton = window.document.getElementById('pe-index-page-skeleton');
    if (skeleton) {
      // null if angular is already loaded
      skeleton.innerHTML = div.innerHTML;
    }

    const classList = window['peCheckoutParams']?.forceNoPaddings
      ? ['col-xs-12']
      : ['col-lg-6', 'col-lg-offset-3', 'col-md-8', 'col-md-offset-2', 'col-sm-10', 'col-sm-offset-1', 'col-xs-12'];
    const layoutAppBody = document.getElementsByClassName('pe-skeleton-box');
    const headerBox = document.getElementsByClassName('pe-header-box');
    addClassesToCollection(layoutAppBody, classList);
    addClassesToCollection(headerBox, classList);

    if (window['pe_onIndexPageSkeletonLoaded']) {
      window['pe_onIndexPageSkeletonLoaded']();
    }
  }

  // For optimization

  function appendStyle(styleStr) {
    const peElement = document.createElement('style');
    peElement.setAttribute('type', 'text/css');
    peElement.appendChild(document.createTextNode(styleStr));
    document.getElementsByTagName('head')[0].appendChild(peElement);
  }

  if (location.search.indexOf('noHeaderOnLoading=true') >= 0) {
    appendStyle(`.layout-no-header-on-loading
    .layout-app-header { display: none !important; }
    .layout-no-header-on-loading
    .layout-app-body { top: 0 !important; }`);
  }

  // This block is special optimization to trigger checkout and flow requests in parallel with main.js loading
  const cookie = document.cookie.split(';').reduce(function (cookieObject, cookieString) {
    const splitCookie = cookieString.split('=');
    try {
      cookieObject[splitCookie[0].trim()] = decodeURIComponent(splitCookie[1]);
    } catch (error) {
      cookieObject[splitCookie[0].trim()] = splitCookie[1];
    }

    return cookieObject;
  }, []);

  const getParams = {};
  try {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach(function (value, key) {
      getParams[key] = value;
    });
  } catch (err) {}

  function isStatus200(status) {
    return ('' + status).length === 3 && ('' + status).substring(0, 1) === '2';
  }

  function request(thePath, method, onlyIfHasToken, successCallback, errorCallback) {
    let localStorageGuestToken = null;
    let localStorageAuthToken = null;
    try {
      localStorageGuestToken = localStorage ? localStorage.getItem('pe_guest_token') : null;
      localStorageAuthToken = localStorage ? localStorage.getItem('pe_auth_token') : null;
    } catch (e) {}
    let token = getParams['guest_token'] || localStorageGuestToken || localStorageAuthToken || cookie['pe_auth_token']; // cookie['pe_auth_token'] will be removed

    if (onlyIfHasToken && !token) {
      errorCallback && errorCallback('Invalid token: ' + Boolean(onlyIfHasToken) + ', ' + Boolean(token));

      return;
    }

    try {
      if (isExpiredToken(token)) {
        token = null;
      }
    } catch (err) {
      console.error(`Clear expired token error:\n ${JSON.stringify(err)}`);
    }

    if (window.fetch) {
      let response = null;
      fetch(thePath, {
        method: method,
        headers: token
          ? {
              Authorization: 'Bearer ' + token,
            }
          : {},
        importance: 'low',
      })
        .then(function (resp) {
          response = resp;
          try {
            return resp['te' + 'xt']();
          } catch (e) {
            const errMsg = 'Cant get text from response!';
            console.error(errMsg);
            errorCallback && errorCallback(errMsg);
          }
        })
        .then(function (dataText) {
          let data = null;
          try {
            data = JSON.parse(dataText);
          } catch (e) {
            // When server returns garbage instead of json
            const errMsg = 'Cant parse json: ' + method + ' ' + thePath + ': ' + response.statusText + ': ' + dataText;
            console.error(errMsg);
            errorCallback && errorCallback(errMsg);
          }

          if (data) {
            if (response.ok) {
              successCallback(data);
            } else {
              let errMsg2 = data.message || response.text || 'Unknown';

              const flowStorage =
                localStorage.getItem(`payever_checkout_flow.${flowId}`) &&
                JSON.parse(localStorage.getItem(`payever_checkout_flow.${flowId}`));
              const flowCreatePath = flowStorage?.flowCreatePath;
              const channelSetId = flowStorage?.nodeFlowStore?.channelSetId;

              if (errMsg2.includes('Expired JWT Token')) {
                if (flowCreatePath) {
                  window.location.href = `/pay/${flowCreatePath}`;
                } else if (channelSetId) {
                  window.location.href = `/pay/create-flow/channel-set-id/${channelSetId}`;
                } else {
                  errMsg2 = errMsg2.replace(
                    data.message || response.text || 'Unknown',
                    (data.message || response.text || 'Unknown') + ' Unkown flow creation path'
                  );
                  console.error(errMsg2);
                  errorCallback(errMsg2);
                }
              } else {
                console.error(errMsg2);
                errorCallback && errorCallback(errMsg2);
              }
            }
          }
        })
        .catch((error) => {
          errorCallback && errorCallback('Catch on fetch: ' + error.toString());
        });
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open(method, thePath, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.withCredentials = true;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (isStatus200(xhr.status)) {
            let parsed =
              xhr.responseType === '' || xhr.responseType === 'text' ? JSON.parse(xhr.responseText) : xhr.response;

            if (typeof parsed === 'string') {
              // For IE prev code is not parsed
              parsed = JSON.parse(parsed);
            }

            successCallback(parsed);
          } else {
            errorCallback && errorCallback('Bad status: ' + xhr.statusText);
          }
        }
      };
      xhr.onerror = function () {
        errorCallback && errorCallback('On error: ' + xhr.statusText);
      };
      try {
        xhr.send();
      } catch (error) {
        errorCallback && errorCallback('Catch on xhr.send(): ' + error.toString());
      }
    }
  }

  //**

  const checkoutLoader = {
    channelSetId: null,
    checkoutData: null,
    successCallback: null,
    errorCallback: null,
    processed: false,
    lastError: null,

    checkoutDataUI: null,
    checkoutDataBase: null,
  };
  window['pe_pageCheckoutLoader'] = checkoutLoader;

  function loadCheckotData(channelSetId) {
    if (!checkoutLoader.processed && Object.assign) {
      // We ignore IE becasue don't want to add extra code for assign
      checkoutLoader.processed = true;

      channelSetId = channelSetId.split('?')[0]; // To remove `?_locale=da`
      const urlSettings = peBackendCheckout + '/api/checkout/channel-set/' + channelSetId + '/full-settings';
      checkoutLoader.channelSetId = channelSetId;

      request(
        urlSettings,
        'GET',
        false,
        function (checkoutData) {
          checkoutLoader.checkoutData = checkoutData;
          initMerchantSkeletonStyle(checkoutData);
          if (checkoutLoader.successCallback) {
            checkoutLoader.successCallback(checkoutLoader.checkoutData);
          }
        },
        function (error) {
          checkoutLoader.channelSetId = null;
          checkoutLoader.lastError = error || 'Not possible to get UI settings from API call';
          if (checkoutLoader.errorCallback) {
            checkoutLoader.errorCallback(checkoutLoader.lastError);
          }
        }
      );
    }
  }

  const partsl = window.location.pathname.split('/').filter(function (a) {
    return a != '';
  });

  if (
    partsl.length == 5 &&
    partsl[1] == 'pay' &&
    (partsl[2] == 'create-flow' || partsl[2] == 'create-flow-from-qr') &&
    partsl[3] == 'channel-set-id'
  ) {
    loadCheckotData(partsl[4].split('?')[0]); // To remove `?_locale=ru`
  } else if (getParams['channelSetId']) {
    loadCheckotData(getParams['channelSetId']);
  }

  const partsf = window.location.pathname.split('/').filter(function (a) {
    return a != '';
  });

  if (partsf.length == 3 && partsf[1] == 'pay') {
    const flowId = partsf[2].split('?')[0]; // To remove `?_locale=ru`
    const urlf = peBackendCheckout + '/api/flow/v1/' + flowId;

    flowLoader.flowId = flowId;
    if (!window.location.href.includes('flow-generator')) {
      request(
        urlf,
        'GET',
        true,
        function (flowData) {
          flowLoader.flowData = flowData;
          const guestToken = flowData.guest_token || flowData.guestToken;
          guestToken && localStorage.setItem('pe_auth_token', guestToken);

          if (flowLoader.successCallback) {
            flowLoader.successCallback(flowData);
          }
          if (flowData.channelSetId) {
            loadCheckotData(flowData.channelSetId);
          }
        },
        function (error) {
          flowLoader.flowId = null;
          flowLoader.lastError = error || 'Not possible to get existing flow from API call';
          if (flowLoader.errorCallback) {
            flowLoader.errorCallback(flowLoader.lastError);
          }
        }
      );
    }
  }

  const flowApiCallCreator = {
    apiCallId: null,
    flowData: null,
    lastError: null,
    successCallback: null,
    errorCallback: null,
    pathname: window.location.pathname.toString(), // For debugging
  };
  window['pe_pageCreateFlowByApiCall'] = flowApiCallCreator;

  const partsx = window.location.pathname.split('/').filter(function (a) {
    return a != '';
  });
  if (partsx.length == 4 && partsx[1] == 'pay' && partsx[2] == 'api-call') {
    const apiCallId = partsx[3].split('?')[0]; // To remove `?_locale=ru`
    const urlx = peBackendCheckout + '/api/flow/v1/api-call/' + apiCallId;

    flowApiCallCreator.apiCallId = apiCallId;
    setTimeout(function () {
      request(
        urlx,
        'POST',
        false,
        function (flowData) {
          const data = {
            ...flowData,
            paymentOptions: flowData.paymentOptions.filter((p) => !!p),
          };

          flowApiCallCreator.flowData = data;
          if (flowApiCallCreator.successCallback) {
            flowApiCallCreator.successCallback(data);
          }
        },
        function (error) {
          flowApiCallCreator.apiCallId = null;
          flowApiCallCreator.lastError = error || 'Not possible to create flow from API call';
          if (flowApiCallCreator.errorCallback) {
            flowApiCallCreator.errorCallback(flowApiCallCreator.lastError);
          }
        }
      );
    }, 1);
  }
}

let skeletonPath = window.peFrontendCheckoutWrapper &&
    `${window.peFrontendCheckoutWrapper}/skeleton/default.html`;

let skeletonId = 'pe-index-page-skeleton-content--default';
let lastSkeleton = null;
try {
  lastSkeleton = sessionStorage.getItem('pe-wrapper-last-skeleton');
} catch (e) {}
const parts = window.location.pathname.split('/').filter(function(a) { return a != ''; });
if (lastSkeleton == 'api-call' || (parts.length == 4 && parts[1] == 'pay' && parts[2] == 'api-call')) {
  try {
    sessionStorage.setItem('pe-wrapper-last-skeleton', 'api-call');
  } catch (e) {}
  lastSkeleton = 'api-call';
  skeletonPath = window.peFrontendCheckoutWrapper
    ? `./skeleton/api-call.html`
    : './api-call.html'
  skeletonId = 'pe-index-page-skeleton-content--api-call';
}

skeletonPath && loadSkeletonTemplate(skeletonPath, skeletonId);

window.initMerchantSkeletonStyle = initMerchantSkeletonStyle;
