import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BackendLoggerService } from '../../../backend-logger/src/services/backend-logger.service';
import { EnvironmentConfigService } from '../../../environment-config/src/services/environment-config.service';
import { MicroRegistryService } from './micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { of, fromEvent, Subscription } from 'rxjs';

describe('MicroRegistryService', () => {

  let microRegistryService: MicroRegistryService;
  let http: HttpClient;
  let environmentConfigService: EnvironmentConfigService;
  let subscription: Subscription;
  let logger: BackendLoggerService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        MicroRegistryService,
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
              backend: {
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
    microRegistryService = TestBed.get(MicroRegistryService);
    http = TestBed.get(HttpClient);
    environmentConfigService = TestBed.get(EnvironmentConfigService);
  });

  it('getRegisteredMicros should receive config and make http get request', () => {
    const uuid: string = '1';
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of({}));
    microRegistryService.getRegisteredMicros(uuid).subscribe(() => {
      expect(httpSpy).toHaveBeenCalled();
      expect(httpSpy.calls.mostRecent().args[0])
        .toEqual(`${environmentConfigService.getConfig().backend.commerceos}/api/apps/business/${uuid}`);
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
    });
  });

  it('getPersonalRegisteredMicros should receive config and make http get request', () => {
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of({}));
    microRegistryService.getPersonalRegisteredMicros().subscribe(() => {
      expect(httpSpy).toHaveBeenCalled();
      expect(httpSpy.calls.mostRecent().args[0])
        .toEqual(`${environmentConfigService.getConfig().backend.commerceos}/api/apps/user`);
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
    });
  });

  it('getAdminRegisteredMicros should receive config and make http get request', () => {
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of({}));
    microRegistryService.getAdminRegisteredMicros().subscribe(() => {
      expect(httpSpy).toHaveBeenCalled();
      expect(httpSpy.calls.mostRecent().args[0])
        .toEqual(`${environmentConfigService.getConfig().backend.commerceos}/api/apps/admin`);
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
    });
  });

  it('getPartnerRegisteredMicros should receive config and make http get request', () => {
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of({}));
    microRegistryService.getPartnerRegisteredMicros().subscribe(() => {
      expect(httpSpy).toHaveBeenCalled();
      expect(httpSpy.calls.mostRecent().args[0])
        .toEqual(`${environmentConfigService.getConfig().backend.commerceos}/api/apps/partner`);
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
    });
  });

  it('getMicroConfig should return registered app by code', () => {
    const code: string = 'something';
    const mockApp: any = {
      code
    };
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of([mockApp]));
    microRegistryService.getPersonalRegisteredMicros().subscribe(() => {
      expect(microRegistryService.getMicroConfig()).toEqual([mockApp]);
      expect(httpSpy).toHaveBeenCalled();
    });
  });

  it('loadBuild should add script to document', () => {
    const isScriptLoadedSpy: jasmine.Spy = spyOn(microRegistryService, 'isScriptLoaded').and.callThrough();
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
    const code: string = 'some';
    const bootstrapScriptUrl: string = 'url';
    const mockMicroApp: any = {
      code,
      bootstrapScriptUrl
    };

    fromEvent(node, 'load').subscribe(() => {
      expect(isScriptLoadedSpy).toHaveBeenCalled();
      expect(documentCreateElemSpy).toHaveBeenCalled();
      expect(documentGetElemByTagNameSpy).toHaveBeenCalled();
    });

    subscription = microRegistryService.scriptLoaded$.subscribe((val: boolean) => {
      expect(val).toBeTruthy();
    });
    microRegistryService.loadBuild(mockMicroApp, false).subscribe();
  });

  afterAll(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
});
