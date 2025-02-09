import { enableProdMode } from '@angular/core';
import { PebAppType } from '@pe/builder-core';
import * as compression from 'compression';
import * as express from 'express';
import { Request, Response } from 'express';
import { exit } from 'process';
import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { ConsumerApi } from './api';
import { DeviceType, DomainInterface } from './interfaces';

require('source-map-support').install();
const MobileDetect = require('mobile-detect');

const dotenv = require('dotenv');
const args = require('yargs').argv;
if (args.dev) {
  dotenv.config();
}

const test = process.env['TEST'] === 'true';

// ssr DOM
const domino = require('domino');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString();
const win = domino.createWindow(template);
const files = fs.readdirSync(`${process.cwd()}/dist/server`);

global['window'] = win;
window['Element'] = domino.impl.Element;

// not implemented property and functions
Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
// mock documnet

global['document'] = win.document;
global['sessionStorage'] = win.sessionStorage;
global['CSS'] = null;
// global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;
global['Prism'] = null;

// import * as cookieparser from 'cookie-parser';
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');
const mainFiles = files.filter((file) => file.startsWith('main'));
const hash = mainFiles[0].split('.')[1];
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(`../dist/server/main.${hash}`);

const PORT = process.env.PORT || 4100;

enableProdMode();

const app = express();
// gzip
app.use(compression());
// cokies
// app.use(cookieparser());

// redirects!
const redirectowww = false;
const redirectohttps = false;
const wwwredirecto = true;
app.use((req, res, next) => {
  // for domain/index.html
  if (req.url === '/index.html') {
    res.redirect(301, 'https://' + req.hostname);
  }

  // check if it is a secure (https) request
  // if not redirect to the equivalent https url
  if (
    redirectohttps &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    req.hostname !== 'localhost'
  ) {
    // special for robots.txt
    if (req.url === '/robots.txt') {
      next();
      return;
    }
    res.redirect(301, 'https://' + req.hostname + req.url);
  }

  // www or not
  if (redirectowww && !req.hostname.startsWith('www.')) {
    res.redirect(301, 'https://www.' + req.hostname + req.url);
  }

  // www or not
  if (wwwredirecto && req.hostname.startsWith('www.')) {
    const host = req.hostname.slice(4, req.hostname.length);
    res.redirect(301, 'https://' + host + req.url);
  }

  // for test
  if (test && req.url === '/test/exit') {
    res.send('exit');
    exit(0);
    return;
  }

  next();
});

// engine
// app.engine(
//   'html',
//   ngExpressEngine({
//     bootstrap: AppServerModuleNgFactory,
//     providers: [provideModuleMap(LAZY_MODULE_MAP)],
//   }),
// );

// must
app.set('view engine', 'html');
app.set('views', 'src');

// all search
app.get('*.*', express.static(path.join(__dirname, '..', 'client')));

app.get('favicon.*', express.static(path.join(__dirname, '..', 'client')));

app.get('*', (req: Request, res: Response) => {
  // mock navigator from req.
  global['navigator'] = req['headers']['user-agent'];

  const deviceType: DeviceType = getDeviceType(req);
  const shopDomain: DomainInterface = getDomain(req);

  const openedRoute: string = getOpenedRoute(req);

  if ( !shopDomain.name || !shopDomain.type ) {
    res.send(getDefaultIndexHtml());
    return;
  }

  getHtmlFromAzure(shopDomain, deviceType, openedRoute)
    .then((html: string) => {
      res.send(html);
    })
    .catch((error) => {
      res.send(getDefaultIndexHtml());
      // res.status(404).send('Shop has no prerendered content');
    });
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});

function getDeviceType(request): DeviceType {
  const mobileDetect = new MobileDetect(request.headers['user-agent']);

  let deviceType;
  if (mobileDetect.phone()) {
    deviceType = 'mobile'; // ScreenSizeEnum.Mobile;
  } else if (mobileDetect.tablet()) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  return deviceType;
}

function getHtmlFromAzure(domain: DomainInterface, deviceType: DeviceType, route: string): Promise<string> {
  const api: ConsumerApi = new ConsumerApi();
  return api.getHtmlFromBlob(domain.name, domain.type, deviceType, route);
}

function getDefaultIndexHtml(): string {
  return template;
}

/**
 * Get domain name for shops and terminals from urls like:
 *  - shopname.payever.shop
 *  - terminal_uuid.payever.business
 * @param request
 */
function getDomain(request: Request): DomainInterface {
  let domainName: string;
  let appType: PebAppType;

  const payeverHosts: string[] = [
    process.env.MICRO_HOST_PRIMARY_SHOP,
    process.env.MICRO_HOST_PRIMARY_BUSINESS,
    process.env.MICRO_HOST_PRIMARY_EMAIL,
  ];

  const isPayeverHost: boolean = payeverHosts.some(peHost => request.hostname.endsWith(peHost));

  if (isPayeverHost) {
    const allowedDomains: string[] = ['shop', 'business'];
    const splittedUrl: string[] = request.hostname.split('.');
    const rootDomain: string = splittedUrl[splittedUrl.length - 1];

    if (allowedDomains.indexOf(rootDomain) >= 0) {
      domainName = splittedUrl[0];
      appType = rootDomain === 'shop'
        ? PebAppType.shop
        : rootDomain === 'business'
          ? PebAppType.pos
          : null;
    }
  } else {
    // NOTE: hostname is like "myshop.com"
    domainName = request.hostname;
    appType = PebAppType.shop; // NOTE: only shop may have own (non-payever) domain
  }

  return { name: domainName, type: appType };
}

function getOpenedRoute(request: Request): string {
  let path: string = request.path;

  if (path === '/') {
    return path;
  } else {
    if (path.startsWith('/')) {
      path = path.substring(1);
    } else if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }
  }

  // NOTE: this case for routes like /PAGE_SLUG/product/PRODUCT_ID - when product card is opened.
  // In that case we need to open PAGE_SLUG
  // const splittedPath: string[] = path.split('/');
  // if (splittedPath.length > 1) {
  //   path = splittedPath[0];
  // }

  return path;
}
