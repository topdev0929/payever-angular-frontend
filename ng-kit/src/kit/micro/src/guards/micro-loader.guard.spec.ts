import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MicroRegistryService } from '../services/micro-registry.service';
import { MicroLoaderService } from '../services/micro-loader.service';
import { of } from 'rxjs/internal/observable/of';
import { MicroLoaderGuard } from './micro-loader.guard';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';

describe('MicroLoaderGuard', () => {

  let microLoaderGuard: MicroLoaderGuard;
  let activatedRouteSnapshot: ActivatedRouteSnapshot;
  let microLoaderService: MicroLoaderService;
  let microRegistryService: MicroRegistryService;
  let subscription: Subscription;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        MicroLoaderGuard,
        {
          provide: MicroRegistryService,
          useValue: {
            getMicroConfig: jasmine.createSpy().and.returnValue([{
              code: 'code'
            }])
          }
        },
        {
          provide: MicroLoaderService,
          useValue: {
            isScriptLoadedbyCode: jasmine.createSpy().and.returnValue(true),
            loadScript: jasmine.createSpy().and.returnValue(of(true)),
            loadBuild: jasmine.createSpy().and.returnValue(of(true))
          }
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            data: {
              dependencies: null,
              useMicroUrlsFromRegistry: null
            }
          }
        }
      ]
    });

    microLoaderGuard = TestBed.get(MicroLoaderGuard);
    activatedRouteSnapshot = TestBed.get(ActivatedRouteSnapshot);
    microLoaderService = TestBed.get(MicroLoaderService);
    microRegistryService = TestBed.get(MicroRegistryService);
  });

  it('canActivate should return true if there is no activatedRouteSnapshot.data.dependencies', () => {
    activatedRouteSnapshot.data.dependencies = null;

    expect(microLoaderGuard.canActivate(activatedRouteSnapshot)).toBeTruthy();
  });

  it('canActivate should return true and load scripts if useMicroUrlsFromRegistry is true', fakeAsync(() => {
    activatedRouteSnapshot.data.dependencies = {};
    activatedRouteSnapshot.data.dependencies.micros = ['code'];
    activatedRouteSnapshot.data.useMicroUrlsFromRegistry = true;

    expect(microLoaderGuard.canActivate(activatedRouteSnapshot)).toBeTruthy();

    tick();

    expect(microLoaderService.isScriptLoadedbyCode).toHaveBeenCalled();
    expect(microRegistryService.getMicroConfig).toHaveBeenCalled();
  }));

  it('canActivate should return observable and load build if useMicroUrlsFromRegistry is false', () => {
    activatedRouteSnapshot.data.dependencies = {};
    activatedRouteSnapshot.data.dependencies.micros = ['code'];
    activatedRouteSnapshot.data.useMicroUrlsFromRegistry = false;

    const result: any = microLoaderGuard.canActivate(activatedRouteSnapshot);
    subscription = result.subscribe(() => {
      expect(microLoaderService.loadBuild).toHaveBeenCalled();
    });
  });

  afterAll(() => {
    subscription.unsubscribe();
  })
});
