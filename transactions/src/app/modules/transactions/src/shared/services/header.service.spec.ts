import { TestBed, fakeAsync } from '@angular/core/testing';
import { HeaderService } from './header.service';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { ApiService } from './api.service';
import { PlatformService } from '@pe/ng-kit/src/kit/common';
import { of } from 'rxjs';

describe('HeaderService', () => {
  let service: HeaderService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [I18nModule.forRoot({})],
      providers: [
        HeaderService,
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: PlatformService,
          useValue: {},
        },
        {
          provide: PlatformHeaderService,
          useValue: {
            setPlatformHeader: () => {},
            registerCallback: () => {},
            unregisterComponentCallback: () => {},
          },
        },
        {
          provide: ApiService,
          useValue: {
          },
        },
      ],
    })
  );

  beforeEach(() => {
    service = TestBed.get(HeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setMainHeader without errors', () => {
    const platformHeaderService = TestBed.get(PlatformHeaderService);
    const platformHeaderServiceSpy = spyOn(
      platformHeaderService,
      'setPlatformHeader'
    );

    service.setMainHeader(true);
    service.setMainHeader(false);
    expect(service).toBeTruthy();
    expect(platformHeaderServiceSpy).toHaveBeenCalledTimes(2);
  });

  it('should setShortHeader without errors', () => {
    const platformHeaderService = TestBed.get(PlatformHeaderService);
    const setPlatformHeaderSpy = spyOn(
      platformHeaderService,
      'setPlatformHeader'
    );
    const registerCallbackSpy = spyOn(
      platformHeaderService,
      'registerCallback'
    );

    service.setShortHeader('test titleKey', () => {});
    expect(service).toBeTruthy();
    expect(registerCallbackSpy).toHaveBeenCalledTimes(1);
    expect(setPlatformHeaderSpy).toHaveBeenCalledTimes(1);
  });

  it('should destroyShortHeader without errors', () => {
    const platformHeaderService = TestBed.get(PlatformHeaderService);
    const unregisterComponentCallbackSpy = spyOn(
      platformHeaderService,
      'unregisterComponentCallback'
    );

    service.destroyShortHeader();
    expect(service).toBeTruthy();
    expect(unregisterComponentCallbackSpy).toHaveBeenCalledTimes(1);
  });

  it('should resetHeader without errors', () => {
    const platformHeaderService = TestBed.get(PlatformHeaderService);
    const platformHeaderServiceSpy = spyOn(
      platformHeaderService,
      'setPlatformHeader'
    );

    service.resetHeader();
    expect(service).toBeTruthy();
    expect(platformHeaderServiceSpy).toHaveBeenCalledTimes(1);
  });
});
