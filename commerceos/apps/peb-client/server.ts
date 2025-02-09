import 'zone.js/dist/zone-node';

import { existsSync } from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';
import { Gzip } from 'zlib';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import express, { NextFunction, Request, Response } from 'express';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import md5 from 'md5';

import { PebClientBootstrapData, PebElementDef, PebPage, PebTheme } from '@pe/builder/core';
import { AppType } from '@pe/common';

import * as blobService from './server/blob.service';
import * as configService from './server/config.service';
import * as elementService from './server/element.service';
import { RabbitMqService } from './server/rabbitmq.service';
import * as stylesService from './server/styles.service';
import * as themeApiService from './server/theme-api.service';
import * as themeCacheService from './server/theme-cache.service';
import * as utils from './server/utils';
import { toTransferObjectScript } from './server/utils/ssr-state.utils';
import { APP_DATA, PEB_STATE_SCRIPT_TAG } from './src/app/constants';
import { find404, findPageByUrl } from './src/app/utils';
import { AppServerModule } from './src/main.server';

const config = configService.serverConfig;

export function app(): express.Express {
  const server = express();

  const distFolder = join(process.cwd(), 'dist/peb-client/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.engine('html', ngExpressEngine({ bootstrap: AppServerModule }));
  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('/api/status', (req, res) => res.send('ok'));

  server.get('/api/themes/:themeId/version/:version/pages/:pageId/elements', async (req, res, next) => {
    const { version, pageId, themeId } = req.params;
    const zipCacheKey = themeCacheService.getElementsZipCacheKey(pageId);
    const cachedData = themeCacheService.getCacheData(themeId, zipCacheKey);

    utils.writeCacheHeader(res);
    utils.writeContentTypeJson(res);
    utils.writeGzipHeader(res);

    if (cachedData) {
      res.write(cachedData);
      res.end();

      return;
    }

    const elements = await elementService.getBrowserRenderElements(themeId, version, pageId);
    if (!elements?.length) {
      next(new ServerError(`elements not defined`, 404, { themeId, version }));

      return;
    }

    themeCacheService.setCacheData(themeId, themeCacheService.getElementsCacheKey(pageId), elements);
    const data = JSON.stringify(elements);
    utils.responseGzipStream(
      res,
      data,
      buffer => themeCacheService.setCacheData(themeId, zipCacheKey, buffer),
    );
  });

  server.get('/styles/themes/:themeId/version/:version/pages/:pageId.css', async (req, res) => {
    const { themeId, version, pageId } = req.params;
    const allowCache = utils.isCacheAllowed(req) && config.useCache;

    utils.writeCacheHeader(res);
    utils.writeContentTypeCss(res);
    utils.writeGzipHeader(res);

    const screens = utils.isCacheAllowed(req) && themeCacheService.getScreens(themeId);
    if (!screens) {
      const domain = utils.getDomain(req);
      const theme = await themeApiService.getThemeByDomain(domain);

      if (!theme?.screens) {
        throw new ServerError('screens not defined', 404, { themeId, version });
      }
      themeCacheService.setScreensData(theme.id, theme.screens);
      themeCacheService.setThemeVersion(theme.id, theme.versionNumber);
    }

    const requestKey = stylesService.getStyleRequestKey(themeId, version, pageId);
    const cachedData = allowCache && await blobService.getCachedData(requestKey);
    if (cachedData) {
      cachedData.pipe(res);

      return;
    }

    const data = await stylesService.getPageStyles(res, themeId, version, pageId);
    utils.responseGzipStream(
      res,
      data,
      buffer => blobService.uploadCacheData(requestKey, buffer),
    );
  });

  server.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow:');
  });

  server.get('*.*', express.static(distFolder, {
    maxAge: '1y',
  }));

  server.get('*', async (req, res, next) => {
    const domain = utils.getDomain(req);
    const language = utils.detectLanguage(req);
    const isSearchEngine = utils.isSearchEngineRequest(req);
    const cacheKey = utils.getRenderCacheKey(req, { domain, language, isSearchEngine });

    const cachedData = config.useCache
      && utils.isCacheAllowed(req)
      && await blobService.hasValidCache(cacheKey)
      && await blobService.getCachedData(cacheKey);
    if (cachedData) {
      utils.writeContentTypeHtml(res);
      utils.writeGzipHeader(res);
      cachedData.pipe(res);

      return;
    }

    let theme: PebTheme | undefined = undefined;
    try {
      theme = await themeApiService.getThemeByDomain(domain);
    } catch (err: any) {
      next(getError(err));

      return;
    }

    if (!theme?.id) {
      next(new ServerError('theme by domain not found', 404, { domain }));

      return;
    }

    const themeId = theme.id;
    const version = theme.versionNumber;
    themeCacheService.setScreensData(themeId, theme.screens);
    let appData: PebClientBootstrapData | undefined = undefined;

    const cachedPages = themeCacheService.getCacheData(themeId, 'pages');
    const pages: PebPage[] = cachedPages?.length > 0
      ? cachedPages
      : await themeApiService.getThemePages(themeId, version);
    !cachedPages && themeCacheService.setCacheData(themeId, 'pages', pages);
    const page = findPageByUrl(pages, req.path) ?? find404(pages);
    if (!page) {
      next(new ServerError(`page not found`, 404, { themeId, version }));

      return;
    }

    const pagesWithElements = await produce(pages, async (draft) => {
      const mainPage = draft.find(p => p.id === page.id);
      const masterPage = draft.find(p => p.id === page.master?.page);

      await Promise.all([
        fillPageElements(theme as PebTheme, mainPage),
        fillPageElements(theme as PebTheme, masterPage),
      ]);
    });

    appData = {
      appType: process.env.APP_TYPE as AppType,
      businessId: theme.businessId ?? '',
      channelSet: theme.channelSet?.id,
      applicationId: theme.applicationId ?? '',
      theme,
      pages: pagesWithElements,
      publishedVersion: theme.versionNumber,
      query: {
        languageKey: language as string,
        isSearchEngine,
        enableLazyLoading: !isSearchEngine,
      },
      config: configService.browserConfig,
    };

    res.render(indexHtml, {
      req,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: APP_DATA, useValue: appData },
      ],
    }, (err, html) => {
      if (err) {
        next(err);
      }

      const script = toTransferObjectScript(appData);
      html = html.replace(PEB_STATE_SCRIPT_TAG, script);

      if (res.writableEnded === true) {
        return;
      }

      utils.writeContentTypeHtml(res);
      utils.writeGzipHeader(res);

      if (!appData) {
        res.status(404);
        res.end();

        return;
      }

      const gzipStream: Gzip = zlib.createGzip();

      const chunks: Buffer[] = [];
      gzipStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      gzipStream.on('end', async () => {
        if (config.useCache && !appData?.hasRenderError) {
          const data = Buffer.concat(chunks);
          const length = data.length;
          length <= config.maxCacheSize && await blobService.uploadCacheData(cacheKey, data);
        }

        const channel = await RabbitMqService.createChannel();
        await channel.assertExchange(process.env.AMQP_EXCHANGE ?? '', 'direct', { durable: true });

        const message = {
          name: process.env.AMQP_ROUTING_KEY ?? '',
          payload: {
            themeId: appData?.theme.id,
            url: req.path,
            hash: md5(cacheKey),
            ids: [],
          },
        };

        channel.publish(
          process.env.AMQP_EXCHANGE ?? '',
          process.env.AMQP_ROUTING_KEY ?? '',
          Buffer.from(JSON.stringify(message)),
        );
      });

      gzipStream.pipe(res);
      gzipStream.write(html);
      gzipStream.end();
    });
  });

  return server;
}

async function fillPageElements(theme: PebTheme, page: WritableDraft<PebPage> | undefined) {
  if (!page?.id) {
    return;
  }

  const pageId = page.id;
  const themeId = theme.id;
  const version = theme.versionNumber;

  let pageElements = await elementService.retrieveElementDefs(themeId, version, pageId);

  page.element = {};
  pageElements.forEach((elm: PebElementDef) => page.element[elm.id] = elm);
}

function getError(err: any): ServerError {
  const status = err?.response?.status ?? 500;

  return new ServerError(err, status);
}

let apm: any = undefined;

function run(): void {
  const port = process.env['PORT'] || 3000;
  const useApm = process.env['SKIP_APM']?.toLowerCase() !== 'true';

  const server = app();

  if (useApm) {
    apm = require('elastic-apm-node').start({
      serviceName: 'client-app',
      serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    });
    server.use(apmLogger);
  }
  server.use(consoleLogger);
  server.use(errorResponder);

  RabbitMqService.establishConnection();

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

function apmLogger(error: ServerError, request: Request, response: Response, next: NextFunction) {
  apm?.captureError(error);
  next(error);
}

function consoleLogger(error: ServerError, request: Request, response: Response, next: NextFunction) {
  console.error({
    host: request.hostname,
    path: request.path,
    query: request.query,
    error: error?.message,
    data: error.data,
  });
  next(error);
}

function errorResponder(error: ServerError, request: Request, response: Response, next: NextFunction) {
  const status = error.status || 500;
  response.status(status).send();
}

class ServerError extends Error {
  status: number;
  data: any;

  constructor(error: any, status: number, data?: any) {
    super(error);

    this.status = status;
    this.data = data;
  }
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule?.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
