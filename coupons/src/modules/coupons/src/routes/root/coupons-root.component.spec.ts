import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EnvService } from '@pe/common';
import { TranslationLoaderService } from '@pe/i18n';
import { of, throwError } from 'rxjs';
import { PeCouponsRootComponent } from './coupons-root.component';

describe('PeCouponsRootComponent', () => {

  let fixture: ComponentFixture<PeCouponsRootComponent>;
  let component: PeCouponsRootComponent;
  let translationLoaderService: jasmine.SpyObj<TranslationLoaderService>;

  beforeEach(async(() => {

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', {
      loadTranslations: of(true),
    });

    TestBed.configureTestingModule({
      declarations: [PeCouponsRootComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: EnvService, useValue: null },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsRootComponent);
      component = fixture.componentInstance;

      translationLoaderService = TestBed.inject(TranslationLoaderService) as jasmine.SpyObj<TranslationLoaderService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    const envServiceMock = { businessData: null };

    /**
     * envService is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData is null
     */
    component = new PeCouponsRootComponent(null, null, envServiceMock as any, translationLoaderService);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    component = new PeCouponsRootComponent(null, null, envServiceMock as any, translationLoaderService);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    component = new PeCouponsRootComponent(null, null, envServiceMock as any, translationLoaderService);

    expect(component.theme).toEqual('light');

  });

  it('should handle ng init', () => {

    const initSpy = spyOn<any>(component, 'initTranslations');

    component.ngOnInit();

    expect(initSpy).toHaveBeenCalled();

  });

  it('should init translations', () => {

    const nextSpy = spyOn(component.translationsReady$, 'next');
    const warnSpy = spyOn(console, 'warn');

    /**
     * translationLoaderService.loadTranslations throws error
     */
    translationLoaderService.loadTranslations.and.returnValue(throwError('test error'));

    component[`initTranslations`]();

    expect(nextSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    /**
     * translationLoaderService.loadTranslations returns TRUE
     */
    warnSpy.calls.reset();
    translationLoaderService.loadTranslations.and.returnValue(of(true));

    component[`initTranslations`]();

    expect(nextSpy).toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

  });

});
