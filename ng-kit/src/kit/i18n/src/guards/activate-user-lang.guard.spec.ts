import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslationLoaderService } from '../services/translation-loader';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ActivateUserLangGuard } from './activate-user-lang.guard';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { DEFAULT_LANG } from '../constants';

describe('ActivateUserLangGuard', () => {

  const users: string = 'users';
  const language: string = 'language';
  let translationLoaderServiceMock: jasmine.SpyObj<TranslationLoaderService>;
  let activateUserLangGuard: ActivateUserLangGuard;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    translationLoaderServiceMock = jasmine.createSpyObj('TranslationLoaderService', ['reloadTranslations']);
    translationLoaderServiceMock.reloadTranslations.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ActivateUserLangGuard,
        {
          provide: TranslationLoaderService,
          useValue: translationLoaderServiceMock
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
          }
        },
        {
          provide: EnvironmentConfigService,
          useValue: {
            getConfig$: jasmine.createSpy().and.returnValue(of({
              backend: {
                users
              }
            }))
          }
        }
      ]
    });

    activateUserLangGuard = TestBed.get(ActivateUserLangGuard);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('canActivate should call http get, reloadTranslations and return observable of true', done => {
    activateUserLangGuard.canActivate().subscribe((result: boolean) => {
      expect(result).toBeTruthy();
      expect(translationLoaderServiceMock.reloadTranslations).toHaveBeenCalledWith(language);
      done();
    });

    const req = httpTestingController.expectOne(`${users}/api/user`);
    req.flush({ language });
  });
});
