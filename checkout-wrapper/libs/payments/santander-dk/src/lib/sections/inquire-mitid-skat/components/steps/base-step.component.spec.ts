import { Component, importProvidersFrom, isDevMode } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { ExternalNavigateData, ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { SharedModule } from '../../../../shared';
import { flowWithPaymentOptionsFixture, localeFixture } from '../../../../test';

import { BaseStepComponent, StepTranslations, StepType } from './base-step.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseStepComponent {
  protected formGroup: FormGroup;
  protected readonly stepType: StepType = StepType.MitId;
  readonly translations: StepTranslations;
  navigationError: string;

  navigate(): void {
    //to avoid eslint error no-empty-function
  }

  pass(): void {
    //to avoid eslint error no-empty-function
  }

  storage(): void {
    //to avoid eslint error no-empty-function
  }
}

describe('BaseStepComponent', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let store: Store;
  let externalNavigateData: ExternalNavigateData;
  let externalRedirectStorage: ExternalRedirectStorage;
  let localeConstantsService: LocaleConstantsService;
  let topLocationService: TopLocationService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        ExternalNavigateData,
        ExternalRedirectStorage,
        TopLocationService,
        LocaleConstantsService,
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    externalNavigateData = TestBed.inject(ExternalNavigateData);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    topLocationService = TestBed.inject(TopLocationService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should get failed and error if value match stepType on init', () => {

    const getValue = jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValueOnce(StepType.MitId);

    component.ngOnInit();

    expect(getValue).toHaveBeenCalledTimes(3);

  });

  it('should call storage if externalNavigateData match stepType on init', () => {

    const storage = jest.spyOn(component, 'storage');
    const getValue = jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValueOnce(StepType.MitId);

    component.ngOnInit();

    expect(getValue).toHaveBeenCalledTimes(3);
    expect(storage).toHaveBeenCalled();

  });

  it('should update error if externalNavigateData match stepType on init', () => {

    const error = 'Test-error';

    const storage = jest.spyOn(component, 'storage');
    const getValue = jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValueOnce(StepType.MitId)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(error);

    component.ngOnInit();

    expect(component.navigationError).toEqual(error);
    expect(getValue).toHaveBeenCalledTimes(3);
    expect(storage).not.toHaveBeenCalled();

  });

  it('should return correct wrapper url', () => {

    jest.spyOn(localeConstantsService, 'getLang').mockReturnValue(localeFixture());

    const checkoutWrapper = isDevMode() ? 'http://localhost:8090' : peEnvFixture().frontend.checkoutWrapper;

    const expectedUrl = `${checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/redirect-out-of-iframe?type=${StepType.MitId}`;

    expect(component['wrapperUrl']).toContain(expectedUrl);

  });

  it('should successfully update topLocationService href', (done) => {

    const testUrl = 'https://test.payever.org';

    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set')
      .mockReturnValue(null);

    component['redirect'](testUrl).subscribe((condition) => {
      expect(condition).toBeTruthy();
      expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
      expect(setHrefSpy).toHaveBeenCalledWith(testUrl);

      done();
    });

  });

  it('should handle redirect error', (done) => {

    const testUrl = 'https://test.payever.org';
    const error = new Error('test');

    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(throwError(error));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set')
      .mockReturnValue(null);

    component['redirect'](testUrl).subscribe((condition) => {
      expect(condition).toBeTruthy();
      expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
      expect(setHrefSpy).not.toHaveBeenCalled();
      expect(component.navigationError).toEqual(error.message);

      done();
    });

  });

  it('should correct extract error message', () => {

    const isArrayError = {
      raw: {
        error: {
          message: ['Error 1', 'Error 2'],
        },
      },
    };
    expect(component['extractErrorMessage'](isArrayError)).toEqual('Error 1, Error 2');

    const isNotArray = {
      raw: {
        error: {
          message: 'Single Error',
        },
      },
    };

    expect(component['extractErrorMessage'](isNotArray)).toEqual('Single Error');

  });

});
