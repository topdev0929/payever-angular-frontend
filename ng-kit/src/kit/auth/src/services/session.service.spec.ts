import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { SessionService } from './session.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('SessionService', () => {
  let sessionService: SessionService;
  let authService: AuthService;
  let configService: EnvironmentConfigService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        SessionService,
        {
          provide: AuthService, useValue: {
            getUserData: jasmine.createSpy().and.returnValue(true),
            logout: jasmine.createSpy().and.returnValue(of({}))
          }
        },
        {
          provide: EnvironmentConfigService, useValue: {
            isDev: jasmine.createSpy().and.returnValue(false)
          }
        }
      ]
    });

    sessionService = TestBed.get(SessionService);
    authService = TestBed.get(AuthService);
    configService = TestBed.get(EnvironmentConfigService);
  });

  it('startUserInactivityDetection should add listeners to document', fakeAsync(() => {
    sessionService.startUserInactivityDetection();
    document.documentElement.dispatchEvent(new Event('click'));

    expect(authService.getUserData).toHaveBeenCalled();

    tick(20 * 60 * 1000);

    expect(configService.isDev).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  }));
});
