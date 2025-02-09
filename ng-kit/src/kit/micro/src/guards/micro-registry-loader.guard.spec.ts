import { TestBed } from '@angular/core/testing';
import { MicroLoaderService } from '../services/micro-loader.service';
import { of, Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { MicroRegistryLoaderGuard } from './micro-registry-loader.guard';

describe('MicroRegistryLoaderGuard', () => {

  let microRegistryLoaderGuard: MicroRegistryLoaderGuard;
  let microLoaderService: MicroLoaderService;
  let activatedRouteSnapshot: ActivatedRouteSnapshot;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        MicroRegistryLoaderGuard,
        {
          provide: MicroLoaderService,
          useValue: {
            loadBuildHash: jasmine.createSpy().and.returnValue(of(true))
          }
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            data: {
              dependencies: null,
              blocking: null
            }
          }
        }
      ]
    });

    microRegistryLoaderGuard = TestBed.get(MicroRegistryLoaderGuard);
    microLoaderService = TestBed.get(MicroLoaderService);
    activatedRouteSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('canActivate should return true is there is no route.data.dependencies', () => {
    expect(microRegistryLoaderGuard.canActivate(activatedRouteSnapshot)).toBeTruthy();
  });

  it('canActivate should return observable if route.data.blocking is true', () => {
    activatedRouteSnapshot.data.dependencies = {};
    activatedRouteSnapshot.data.dependencies.micros = ['1'];
    activatedRouteSnapshot.data.blocking = true;

    expect(microRegistryLoaderGuard.canActivate(activatedRouteSnapshot) instanceof Observable).toBeTruthy();
    expect(microLoaderService.loadBuildHash).toHaveBeenCalled();
  });

  it('canActivate should return true route.data.blocking is false', () => {
    activatedRouteSnapshot.data.dependencies = {};
    activatedRouteSnapshot.data.dependencies.micros = ['1'];
    activatedRouteSnapshot.data.blocking = false;

    expect(microRegistryLoaderGuard.canActivate(activatedRouteSnapshot)).toBeTruthy();
    expect(microLoaderService.loadBuildHash).toHaveBeenCalled();
  });
});
