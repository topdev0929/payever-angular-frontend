import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { values } from 'lodash-es';
import { fromEvent, Observable, Subject, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { BackendLoggerService } from '../../../backend-logger';
import { MicroRegistry, MicroRegistrySctiptInfo } from '../types';
// Long paths are here to avoid circular dependencies
import { EnvironmentConfigService } from '../../../environment-config/src/services/environment-config.service';

export class BaseMicroService {

  scriptLoaded$: Subject<boolean> = new Subject<boolean>();

  protected logger: BackendLoggerService = this.injector.get(BackendLoggerService);
  protected httpClient: HttpClient = this.injector.get(HttpClient);
  protected configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);

  constructor(protected injector: Injector) {}

  isScriptLoaded(url: string): boolean {
    return this.registry.scripts[url] && this.registry.scripts[url].loaded;
  }

  isScriptLoadedbyCode(microCode: string): boolean {
    let microData: MicroRegistrySctiptInfo;
    if (this.registry) {
      microData = values(this.registry.scripts)
        .find((microInfo: MicroRegistrySctiptInfo) => microInfo.code === microCode);
    }
    return microData && microData.loaded;
  }

  loadScript(url: string, microCode: string): Observable<boolean> {
    if (this.isScriptLoaded(url)) {
      return of(true);
    }
    const logStart: number = (new Date()).getTime();
    const script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      this.markScriptAsLoaded(url, microCode);
    };
    script.src = url;
    script.onerror = (error: any) => {
      const n = window.navigator;
      const s = window.screen;
      const userDetails = `${n.platform} / ${n.language} / ${s.width}x${s.height} / ${n.userAgent}`;
      this.logger.logError(
        `Not possible to load script '${url}' during ${(new Date()).getTime() - logStart}ms:\n ${JSON.stringify(error)}\nDetails: ${userDetails}`
      );
    };
    document.getElementsByTagName('head')[0].appendChild(script);
    return fromEvent(script, 'load').pipe(
      take(1),
      map((event: Event) => true)
    );
  }

  unloadScript(url: string): void {
    Array.from(document.querySelectorAll(`script[src="${url}"]`)).forEach(e => e.parentNode.removeChild(e));
    if (this.registry.scripts[url]) {
      this.registry.scripts[url].loaded = false;
    }
  }

  protected markScriptAsLoaded(url: string, microCode: string): void {
    this.scriptLoaded$.next(true);
    this.registry.scripts[url] = { loaded: true, code: microCode };
  }

  protected get registry(): MicroRegistry {
    if (!window['pe_registry']) {
      window['pe_registry'] = {
        buildHashes: {},
        buildMicroConfigs: {},
        scripts: {},
        registered: []
      };
    }
    return window['pe_registry'];
  }
}
