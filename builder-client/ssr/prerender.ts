import { renderModuleFactory } from '@angular/platform-server';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { from, merge, Observable } from 'rxjs';
import { ENV_CONFIG_TOKEN } from '@pe/ng-kit/src/kit/environment-config/src/env-config-module-config-token';
import { EnviromentConfigModuleConfigInterface } from '@pe/ng-kit/src/kit/environment-config/src/interfaces/enviroment-config-module-config.interface';
import { readFileSync } from 'fs';
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { map } from 'rxjs/operators';
import { DeviceType, RouteHtmlInterface } from './interfaces';

const domino = require('domino');
const fs = require('fs');
const path = require('path');

export class UniversalPrerenderer {

  prerender(domain: string, routes: string[], deviceType: DeviceType): Observable<RouteHtmlInterface> {
    const template: string = readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString();
    const win = domino.createWindow(template);
    global['window'] = win;
    Object.defineProperty(win.document.body.style, 'transform', {
      value: () => {
        return {
          enumerable: true,
          configurable: true,
        };
      },
    });
    global['document'] = win.document;
    global['CSS'] = null;
    global['Prism'] = null;

    const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(`../dist/server/main`);

    const renderObsArray: Observable<RouteHtmlInterface>[] = [];
    for(const route of routes) {
      const renderPromise: Promise<string> = this.getRenderPromise(
        template,
        AppServerModuleNgFactory,
        LAZY_MODULE_MAP,
        domain,
        deviceType,
        route
      );

      const render$: Observable<RouteHtmlInterface> = from(renderPromise).pipe(map((html: string) => {
        return { route, html };
      }));
      renderObsArray.push(render$);
    }

    return merge(...renderObsArray);
  }

  private getRenderPromise(
    template: string,
    appServerModuleNgFactory: any,
    lazyModuleMap: any,
    domain: string,
    deviceType: DeviceType,
    route: string
  ): Promise<string> {
    return renderModuleFactory(appServerModuleNgFactory, {
      document: template,
      url: route,
      extraProviders: [
        provideModuleMap(lazyModuleMap),
        {
          provide: REQUEST,
          useValue: { cookie: '', headers: {} },
        },
        {
          provide: RESPONSE,
          useValue: {},
        },
        {
          provide: 'ORIGIN_URL',
          useValue: ''// environment.host,
        },
        {
          provide: 'CLIENT_DOMAIN',
          useValue: domain
        },
        // Inject token from ng-kit
        {
          provide: 'DEVICE_TYPE',
          useValue: deviceType
        },
        {
          provide: 'ENV_CONFIG_TOKEN',
          useValue: { absoluteRootUrl: process.env.MICRO_URL_FRONTEND_BUILDER_CLIENT } as EnviromentConfigModuleConfigInterface
        }
      ],
    });
  }
}
