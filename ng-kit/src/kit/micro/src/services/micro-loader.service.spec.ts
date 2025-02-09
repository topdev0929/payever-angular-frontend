import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentConfigService } from '../../../environment-config/src/services/environment-config.service';
import { HttpClient } from '@angular/common/http';
import { of, Subscription, fromEvent } from 'rxjs';
import { MicroLoaderService } from './micro-loader.service';
import { BackendLoggerService } from '../../../backend-logger/src/services/backend-logger.service';
import { Injector } from '@angular/core';

describe('MicroRegistryService', () => {

  let microLoaderService: MicroLoaderService;
  let http: HttpClient;
  let environmentConfigService: EnvironmentConfigService;
  const subscription: Subscription = new Subscription();
  let logger: BackendLoggerService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        Injector,
        MicroLoaderService,
        {
          provide: BackendLoggerService,
          useValue: {
            logError: () => ''
          }
        },
        {
          provide: EnvironmentConfigService,
          useValue: {
            getConfig: jasmine.createSpy('getConfig').and.returnValue({
              frontend: {
                commerceos: 'commerceos'
              }
            })
          }
        },
        {
          provide: HttpClient,
          useValue: {
            post: () => of({}),
            get: () => of({})
          }
        }
      ]
    });

    logger = TestBed.get(BackendLoggerService);
    microLoaderService = TestBed.get(MicroLoaderService);
    http = TestBed.get(HttpClient);
    environmentConfigService = TestBed.get(EnvironmentConfigService);
  });

  it('isScriptLoaded should return true if service is loaded', () => {
    window['pe_registry'] = {
      scripts: {
        url: {
          loaded: true
        }
      }
    };
    const url: string = 'url';

    expect(microLoaderService.isScriptLoaded(url)).toBeTruthy();
  });

  it('isScriptLoaded should return undefined if service is not loaded', () => {
    window['pe_registry'] = {
      scripts: {
        urlq: {
          loaded: true
        }
      }
    };
    const url: string = 'url';

    expect(microLoaderService.isScriptLoaded(url)).not.toBeDefined();
  });

  it('isScriptLoadedbyCode should return true if script is loaded by code', () => {
    const code: string = 'code';
    window['pe_registry'] = {
      scripts: {
        urlq: {
          code,
          loaded: true
        }
      }
    };

    expect(microLoaderService.isScriptLoadedbyCode(code)).toBeTruthy();
  });

  it('isScriptLoadedbyCode should return undefined if script is not loaded by code', () => {
    const code: string = 'code';
    window['pe_registry'] = {
      scripts: {
        urlq: {
          code
        }
      }
    };

    expect(microLoaderService.isScriptLoadedbyCode(code)).not.toBeDefined();
  });

  it('loadBuildHash should call http.get and create build hash observable ', () => {
    const microCode: string = 'code';
    const mockHashmap: any = {
      micro: microCode
    };
    const url: string = 'url';
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of(mockHashmap));
    const getResourceUrlSpy: jasmine.Spy = spyOn(microLoaderService, 'getResourceUrl').and.returnValue(url);

    microLoaderService.loadBuildHash(microCode);

    expect(httpSpy.calls.mostRecent().args[0]).toEqual(url);
    expect(getResourceUrlSpy.calls.mostRecent().args[0]).toEqual(microCode);

    const sub: Subscription = microLoaderService.loadBuildHash(microCode).subscribe((val: any) => {
      expect(val).toBe(microCode);
    });
    subscription.add(sub);
  });

  it('loadBuildMicroConfig should call http.get and create build micro config observable ', () => {
    const microCode: string = 'code';
    const mockHashmap: string = 'hashmap';
    const url: string = 'url';
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of(mockHashmap));
    const getResourceUrlSpy: jasmine.Spy = spyOn(microLoaderService, 'getResourceUrl').and.returnValue(url);

    microLoaderService.loadBuildMicroConfig(microCode);

    expect(httpSpy.calls.mostRecent().args[0]).toEqual(url);
    expect(getResourceUrlSpy.calls.mostRecent().args[0]).toEqual(microCode);

    const sub: Subscription = microLoaderService.loadBuildMicroConfig(microCode).subscribe((val: any) => {
      expect(val).toBe(mockHashmap);
    });
    subscription.add(sub);
  });

  it('loadBuild should call loadBuildHash ', () => {
    const microCode: string = 'code';
    const loadBuildHashSpy: jasmine.Spy = spyOn(microLoaderService, 'loadBuildHash').and.returnValue(of('hash'));
    const loadScriptSpy: jasmine.Spy = spyOn(microLoaderService, 'loadScript').and.returnValue(of(true));
    const getResourceUrlSpy: jasmine.Spy = spyOn(microLoaderService, 'getResourceUrl').and.stub();

    microLoaderService.loadBuild(microCode, true);

    expect(loadBuildHashSpy.calls.mostRecent().args[0]).toBe(microCode);

    const sub: Subscription = microLoaderService.loadBuild(microCode, true).subscribe(() => {
      expect(loadScriptSpy).toHaveBeenCalled();
      expect(getResourceUrlSpy).toHaveBeenCalled();
    });
    subscription.add(sub);
  });

  it('loadInnerMicroBuild should call loadBuildHash', () => {
    const microCode: string = 'code';
    const loadBuildHashSpy: jasmine.Spy = spyOn(microLoaderService, 'loadBuildHash').and.returnValue(of('hash'));
    const loadScriptSpy: jasmine.Spy = spyOn(microLoaderService, 'loadScript').and.returnValue(of(true));
    const getResourceUrlSpy: jasmine.Spy = spyOn(microLoaderService, 'getResourceUrl').and.stub();
    const config: any = {
      innerMicros: {
        code: {
          bootstrapScriptUrl: 'url'
        }
      }
    };
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of(config));

    microLoaderService.loadInnerMicroBuild(microCode, microCode, true);

    expect(loadBuildHashSpy.calls.mostRecent().args[0]).toBe(microCode);

    const sub: Subscription = microLoaderService.loadInnerMicroBuild(microCode, microCode, true).subscribe(() => {
      expect(loadScriptSpy).toHaveBeenCalled();
      expect(getResourceUrlSpy).toHaveBeenCalled();
    });
    subscription.add(sub);
  });

  it('loadScript should load script', () => {
    const isScriptLoadedSpy: jasmine.Spy = spyOn(microLoaderService, 'isScriptLoaded').and.returnValue(false);
    const node: HTMLElement = document.createElement('script');
    const documentCreateElemSpy: jasmine.Spy = spyOn(document, 'createElement').and.returnValue(node);
    const headElement: any = {
      appendChild: () => {
        node.dispatchEvent(new Event('load'));
      }
    };
    const documentGetElemByTagNameSpy: jasmine.Spy = spyOn(document, 'getElementsByTagName').and.returnValue([
      headElement
    ] as unknown as HTMLCollectionOf<Element>);
    const url: string = 'url';
    const microCode: string = 'code';

    const firstSub: Subscription = fromEvent(node, 'load').subscribe(() => {
      expect(isScriptLoadedSpy).toHaveBeenCalled();
      expect(documentCreateElemSpy).toHaveBeenCalled();
      expect(documentGetElemByTagNameSpy).toHaveBeenCalled();
    });

    const secondSub: Subscription = microLoaderService.loadScript(url, microCode).subscribe();
    subscription.add(firstSub);
    subscription.add(secondSub);
  });

  it('unloadScript should unload script', () => {
    const url: string = 'urltesturl';
    const script: any = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);

    expect(Array.from(document.getElementsByTagName('script')).find((node: any) => node.src.indexOf(url) !== -1)).toBeDefined();
    microLoaderService.unloadScript(url);

    expect(Array.from(document.getElementsByTagName('script')).find((node: any) => node.src.indexOf(url) !== -1)).not.toBeDefined();
  });

  afterEach(() => {
    window['pe_registry'] = null;
  });

  afterAll(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
});
