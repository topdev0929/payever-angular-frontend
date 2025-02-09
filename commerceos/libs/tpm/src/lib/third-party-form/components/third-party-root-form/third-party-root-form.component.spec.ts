import { HttpClient } from '@angular/common/http';
import { QueryList } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { skip } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PeAuthService } from '@pe/auth';
import { SnackBarService } from '@pe/forms';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';

import { OperationInterface, ThirdPartyFormServiceInterface } from '../../interfaces';

import { ThirdPartyRootFormComponent } from './third-party-root-form.component';

describe('ThirdPartyRootFormComponent', () => {

  let fixture: ComponentFixture<ThirdPartyRootFormComponent>;
  let component: ThirdPartyRootFormComponent;
  let http: any;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;
  let thirdPartyFormService: jasmine.SpyObj<ThirdPartyFormServiceInterface>;
  let translationLoaderService: jasmine.SpyObj<TranslationLoaderService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async(() => {

    const httpSpy = jasmine.createSpyObj('HttpClient', [
      'request',
      'get',
    ]);

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', {
      loadTranslations: of(true),
    });

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      hasTranslation: true,
      translate: 'translated',
    });

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'sanitized',
    });

    const snackBarServiceSpy = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['toggle']);

    thirdPartyFormService = jasmine.createSpyObj<ThirdPartyFormServiceInterface>('ThirdPartyFormServiceInterface', [
      'requestInitialForm',
      'prepareUrl',
      'getActionUrl',
      'allowCustomActions',
      'executeAction',
    ]);
    thirdPartyFormService.requestInitialForm.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [
        ThirdPartyRootFormComponent,
      ],
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeAuthService, useValue: {} },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ThirdPartyRootFormComponent);
      component = fixture.componentInstance;

      http = TestBed.inject(HttpClient);
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      snackBarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      translationLoaderService = TestBed.inject(TranslationLoaderService) as jasmine.SpyObj<TranslationLoaderService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

      component.thirdPartyFormService = thirdPartyFormService;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set payever fields data', () => {

    const fieldsData = {
      pe_test: { test: 'pe' },
      test: { test: '' },
    };
    const errorSpy = spyOn(console, 'error');

    component.setPayeverFieldsData = fieldsData;

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(component.payeverFieldsData).toEqual({ pe_test: fieldsData.pe_test });
    expect(fieldsData.test).toBeUndefined();

  });

  it('should get form', () => {

    const generatorMock = {
      form: new FormGroup({
        test: new FormControl(),
      }),
    };

    /**
     * component.infoBoxGeneratorForm is undefined
     */
    expect(component.form).toBeNull();

    /**
     * component.infoBoxGeneratorForm is set
     */
    component.infoBoxGeneratorForm = generatorMock as any;

    expect(component.form).toEqual(generatorMock.form);

  });

  it('should get first submit operation', () => {

    const leftOperationsMock = [
      { isSubmit: false },
      { isSubmit: true },
    ];
    const rightOperationsMock = [
      { isSubmit: false },
      { isSubmit: false },
    ];
    const expected = leftOperationsMock.find(o => o.isSubmit);

    /**
     * component.leftOperations & rightOperations is undefined
     */
    expect(component[`firstSubmitOperation`]).toBeUndefined();

    /**
     * component.leftOperations & rightOperations is set
     */
    component.leftOperations = leftOperationsMock as any;
    component.rightOperations = rightOperationsMock as any;

    expect(component[`firstSubmitOperation`]).toEqual(expected as any);

  });

  it('should get info box & confirm settings', () => {

    const infoBoxTypeSettings = { type: 'info-box' };
    const confirmTypeSettings = { type: 'confirm' };

    /**
     * getting infoBoxSettings
     */
    component.settings = infoBoxTypeSettings as any;
    expect(component.infoBoxSettings).toEqual(infoBoxTypeSettings as any);

    /**
     * getting confirmSettings
     */
    component.settings = confirmTypeSettings as any;
    expect(component.confirmSettings).toEqual(confirmTypeSettings as any);

  });

  it('should start third party on init', fakeAsync(() => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const closeSpy = jasmine.createSpy('peClosePopUpOfTPM');
    const warnSpy = spyOn(console, 'warn');
    const nextSpy = spyOn(component.$translationsReady, 'next');

    /**
     * component.translationsCategory is null
     * window.opener is null
     */
    component.ngOnInit();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(translationLoaderService.loadTranslations).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith(true);

    /**
     * calling window.onafterprint callback
     */
    window.onafterprint(null);

    expect(component.printImageUrl).toBeNull();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * component.translationsCategory is set
     * translationLoaderService.loadTranslations returns TRUE
     * peClosePopUpOfTPM function exists in window.opener
     */
    window.opener = { peClosePopUpOfTPM: closeSpy };

    component.translationsCategory = 'translation.category';
    component.ngOnInit();

    tick(3000);

    expect(closeSpy).toHaveBeenCalled();
    expect(translationLoaderService.loadTranslations).toHaveBeenCalledWith(['tpm-translation.category', 'tpm-forms']);
    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * translationLoaderService.loadTranslations throws error
     */
    translationLoaderService.loadTranslations.and.returnValue(throwError('test error'));

    component.ngOnInit();

    tick(3000);

    expect(warnSpy).toHaveBeenCalled();

  }));

  it('should start third party', () => {

    const setInfoBoxSettingsSpy = spyOn(component, 'setInfoBoxSettings');
    const showErrorSpy = spyOn<any>(component, 'showError');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    /**
     * thirdPartyFormService.requestInitialForm returns null
     */
    component.startThirdParty();

    expect(thirdPartyFormService.requestInitialForm).toHaveBeenCalled();
    expect(setInfoBoxSettingsSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * thirdPartyFormService.requestInitialForm returns data without form
     */
    thirdPartyFormService.requestInitialForm.and.returnValue(of({}) as any);

    component.startThirdParty();

    expect(setInfoBoxSettingsSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * thirdPartyFormService.requestInitialForm returns data with form
     */
    thirdPartyFormService.requestInitialForm.and.returnValue(of({ form: { test: true } }) as any);

    component.startThirdParty();

    expect(setInfoBoxSettingsSpy).toHaveBeenCalledWith({ test: true } as any);
    expect(showErrorSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * thirdPartyFormService.requestInitialForm throws error
     */
    setInfoBoxSettingsSpy.calls.reset();
    thirdPartyFormService.requestInitialForm.and.returnValue(throwError({ message: 'test error' }));

    component.startThirdParty();

    expect(setInfoBoxSettingsSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('test error');
    expect(component.currentOperation).toBeNull();
    expect(component.formLoading).toBe(false);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get debug button', () => {

    const btnText = '<strong>&lt;test&gt;</strong>';

    /**
     * component.isShowDebugButtonText is FALSE as default
     */
    expect(component.btnDebug('test')).toEqual('');

    /**
     * component.isShowDebugButtonText is TRUE
     */
    component[`isShowDebugButtonText` as any] = true;
    expect(component.btnDebug('test')).toEqual(btnText);

  });

  it('should update operations', () => {

    const operations = [
      { align: 'left' },
      { align: 'right' },
    ];

    component.updateOperations(operations as any);

    expect(component.leftOperations).toEqual([operations[0]] as any);
    expect(component.rightOperations).toEqual([operations[1]] as any);

  });

  it('should get search operation', () => {

    const operations = [
      { text: 'Test' },
      { text: 'Test' },
    ];
    const searchOperation = operations[1];

    /**
     * searchOperation.text is not equal to 'Search'
     */
    component.rightOperations = operations as any;

    expect(component.getSearchOperation()).toBeNull();

    /**
     * searchOperation.text is equal to 'Search'
     */
    searchOperation.text = 'Search';
    component.rightOperations = operations as any;

    expect(component.getSearchOperation()).toEqual(searchOperation as any);

  });

  it('should handle form change', () => {

    const hasAsyncFieldSpy = spyOn(component, 'hasAsyncField');
    const getSubmittedFormSpy = spyOn<any>(component, 'getSubmittedForm');
    const performOperationSpy = spyOn(component, 'performOperation');
    const getSearchOperationSpy = spyOn(component, 'getSearchOperation');
    const performPayeverOperationSpy = spyOn(component, 'performPayeverOperation');
    const formSpy = spyOnProperty(component, 'form');
    const fieldset = [{ asyncSave: true }];
    const operation = { align: 'right', action: 'action' };

    /**
     * component.hasAsyncField returns FALSE
     */
    hasAsyncFieldSpy.and.returnValue(false);

    component.onFormChange(null, fieldset as any);

    expect(hasAsyncFieldSpy).toHaveBeenCalledWith(fieldset as any);
    expect(getSubmittedFormSpy).not.toHaveBeenCalled();
    expect(performOperationSpy).not.toHaveBeenCalled();
    expect(getSearchOperationSpy).not.toHaveBeenCalled();
    expect(performPayeverOperationSpy).not.toHaveBeenCalled();

    /**
     * component.hasAsyncField returns TRUE
     * argument operation for onFormChange function is set
     */
    hasAsyncFieldSpy.and.returnValue(true);
    getSubmittedFormSpy.and.returnValue({ test: 'form' });

    component.onFormChange(null, fieldset as any, operation as any);

    expect(getSubmittedFormSpy).toHaveBeenCalledWith(operation.action);
    expect(performOperationSpy).toHaveBeenCalledWith(operation as any, fieldset as any, true);
    expect(performPayeverOperationSpy).toHaveBeenCalledWith(fieldset as any, true);
    expect(getSearchOperationSpy).not.toHaveBeenCalled();

    /**
     * argument operation for onFormChange function is undefined as default
     * component.getSearchOperation returns null
     * component.firstSubmitOperation is undefined
     */
    performOperationSpy.calls.reset();
    getSubmittedFormSpy.calls.reset();
    getSearchOperationSpy.and.returnValue(null);

    component.onFormChange(null, fieldset as any);

    expect(getSubmittedFormSpy).not.toHaveBeenCalled();
    expect(performOperationSpy).not.toHaveBeenCalled();

    /**
     * component.firstSubmitOperation is set
     */
    spyOnProperty<any>(component, 'firstSubmitOperation').and.returnValue(operation);
    component.onFormChange(null, fieldset as any);

    expect(getSubmittedFormSpy).not.toHaveBeenCalled();
    expect(performOperationSpy).toHaveBeenCalledWith(operation as any, fieldset as any, true);

    /**
     * component.getSearchOperation returns mocked search operation
     * component.form is null
     */
    performOperationSpy.calls.reset();
    formSpy.and.returnValue(null);
    getSearchOperationSpy.and.returnValue({ ...operation, text: 'Search' } as any);

    component.onFormChange(null, fieldset as any);

    expect(performOperationSpy).not.toHaveBeenCalled();

    /**
     * component.form is set
     * component.form.value.number.length is 3
     */
    formSpy.and.returnValue({
      value: {
        number: 455,
      },
    });

    component.onFormChange(null, fieldset as any);

    expect(performOperationSpy).toHaveBeenCalledWith({ ...operation, text: 'Search' } as any, fieldset as any, true);

  });

  it('should handle form submit', () => {

    const getSubmittedFormSpy = spyOn<any>(component, 'getSubmittedForm').and.returnValue({ test: 'form' });
    const performOperationSpy = spyOn(component, 'performOperation');
    const getSearchOperationSpy = spyOn(component, 'getSearchOperation');
    const performPayeverOperationSpy = spyOn(component, 'performPayeverOperation');
    const formSpy = spyOnProperty(component, 'form');
    const fieldset = [{ asyncSave: true }];
    const operation = { action: 'action' };

    /**
     * argument for onFormSubmit function is set
     */
    component.onFormSubmit(null, fieldset as any, operation as any);

    expect(getSubmittedFormSpy).toHaveBeenCalledWith(operation.action);
    expect(performOperationSpy).toHaveBeenCalledWith(operation as any, fieldset as any);
    expect(getSearchOperationSpy).not.toHaveBeenCalled();
    expect(performPayeverOperationSpy).toHaveBeenCalledWith(fieldset as any);

    /**
     * argument operation for onFormSubmit function is undefined as default
     * component.getSearchOperation returns null
     * component.firstSubmitOperation is undefined
     */
    performOperationSpy.calls.reset();
    getSubmittedFormSpy.calls.reset();
    getSearchOperationSpy.and.returnValue(null);

    component.onFormSubmit(null, fieldset as any);

    expect(getSubmittedFormSpy).not.toHaveBeenCalled();
    expect(performOperationSpy).not.toHaveBeenCalled();

    /**
     * component.firstSubmitOperation is set
     */
    spyOnProperty<any>(component, 'firstSubmitOperation').and.returnValue(operation);
    component.onFormSubmit(null, fieldset as any);

    expect(getSubmittedFormSpy).not.toHaveBeenCalled();
    expect(performOperationSpy).toHaveBeenCalledWith(operation as any, fieldset as any);

    /**
    * component.getSearchOperation returns mocked search operation
    * component.form is null
    */
    performOperationSpy.calls.reset();
    formSpy.and.returnValue(null);
    getSearchOperationSpy.and.returnValue({ ...operation, text: 'Search' } as any);

    component.onFormSubmit(null, fieldset as any);

    expect(performOperationSpy).not.toHaveBeenCalled();

    /**
     * component.form is set
     * component.form.value.number.length is 3
     */
    formSpy.and.returnValue({
      value: {
        number: 455,
      },
    });

    component.onFormSubmit(null, fieldset as any);

    expect(performOperationSpy).toHaveBeenCalledWith({ ...operation, text: 'Search' } as any, fieldset as any);

  });

  it('should make operation link', () => {

    const operation = {
      action: 'action',
      forceUrl: 'force.url',
    };

    thirdPartyFormService.prepareUrl.and.returnValue('prepared.url');
    thirdPartyFormService.getActionUrl.and.returnValue('got.action.url');

    /**
     * component.thirdPartyFormService is null
     * operation.forceUrl is null
     */
    component.thirdPartyFormService = null;

    expect(component.operationLink({ ...operation, forceUrl: null } as any)).toBeUndefined();
    expect(thirdPartyFormService.prepareUrl).not.toHaveBeenCalled();
    expect(thirdPartyFormService.getActionUrl).not.toHaveBeenCalled();

    /**
     * component.thirdPartyFormService is null
     * operation.forceUrl is set
     */
    expect(component.operationLink(operation as any)).toBeUndefined();
    expect(thirdPartyFormService.prepareUrl).not.toHaveBeenCalled();
    expect(thirdPartyFormService.getActionUrl).not.toHaveBeenCalled();

    /**
     * component.thirdPartyFormService is set
     * operation.forceUrl is null
     */
    component.thirdPartyFormService = thirdPartyFormService;

    expect(component.operationLink({ ...operation, forceUrl: null } as any)).toEqual('got.action.url');
    expect(thirdPartyFormService.prepareUrl).not.toHaveBeenCalled();
    expect(thirdPartyFormService.getActionUrl).toHaveBeenCalledWith('action');

    /**
     * component.thirdPartyFormService is set
     * operation.forceUrl is set
     */
    thirdPartyFormService.getActionUrl.calls.reset();

    expect(component.operationLink(operation as any)).toEqual('prepared.url');
    expect(thirdPartyFormService.prepareUrl).toHaveBeenCalled();
    expect(thirdPartyFormService.getActionUrl).not.toHaveBeenCalled();

  });

  it('should check is operation loading', () => {

    const operation = { test: 'operation' } as any;

    /**
     * component.currentOperation is null & not equal to operation
     */
    expect(component.isOperationLoading(operation)).toBe(false);

    /**
     * component.operation is set & equal to operation
     */
    component.currentOperation = operation;
    expect(component.isOperationLoading(operation)).toBe(true);

  });

  it('should perform oparation', () => {

    const operation: OperationInterface = {
      action: 'action',
      forceUrl: 'force.url',
      isSubmit: true,
      open: 'blank',
      width: null,
      height: null,
      actionData: { test: true },
      refreshOperation: null,
    };
    const fieldset = [{ test: 'fieldset' }] as any;
    const performOperationSpy = spyOn(component, 'performOperation').and.callThrough();
    const operationLinkSpy = spyOn(component, 'operationLink').and.returnValue('operation.link');
    const sendRequestSpy = spyOn(component, 'sendRequest');
    const openSpy = spyOn(window, 'open').and.returnValue(null);
    const windowMock = {
      focus: jasmine.createSpy('focus'),
      close: jasmine.createSpy('close'),
    };
    const lastRequestMock = {
      subscribe: jasmine.createSpy('subscribe'),
    };

    spyOnProperty(component, 'form').and.returnValue({ invalid: true });

    component[`lastRequest`] = lastRequestMock as any;

    /**
     * argument operation is set
     * operation.open is 'blank'
     * arguments not set:
     *
     * fieldset
     * onlyForAsyncFields
     * onFail
     *
     * window.open returns null
     */
    component.performOperation(operation);

    expect(operationLinkSpy).toHaveBeenCalledWith(operation);
    expect(openSpy).toHaveBeenCalledWith('operation.link', 'window');
    expect(windowMock.focus).not.toHaveBeenCalled();

    /**
     * window.open returns mocked window
     */
    openSpy.and.returnValue(windowMock as any);

    component.performOperation(operation);

    expect(windowMock.focus).toHaveBeenCalled();

    /**
     * operation.open is 'popup'
     * window.open returns null
     * call window.peClosePopUpOfTPM
     */
    windowMock.focus.calls.reset();
    openSpy.and.returnValue(null);
    operation.open = 'popup';

    (window.innerWidth as any) = null;
    (window.innerHeight as any) = null;
    spyOnProperty(document.documentElement, 'clientWidth').and.returnValue(null);
    spyOnProperty(document.documentElement, 'clientHeight').and.returnValue(null);
    spyOnProperty(document.body, 'clientWidth').and.returnValue(1000);
    spyOnProperty(document.body, 'clientHeight').and.returnValue(1000);

    component.performOperation(operation);

    expect(openSpy).toHaveBeenCalledWith(
      'operation.link',
      '_blank',
      'width=500,height=500,left=250,top=250',
    );
    expect(component.currentOperation).toBeNull();
    expect(component.formLoading).toBe(false);
    expect(window[`peClosePopUpOfTPM`]).toBeDefined();

    performOperationSpy.calls.reset();
    window[`peClosePopUpOfTPM`]();

    expect(windowMock.focus).not.toHaveBeenCalled();
    expect(windowMock.close).not.toHaveBeenCalled();
    expect(performOperationSpy).not.toHaveBeenCalled();
    expect(lastRequestMock.subscribe).not.toHaveBeenCalled();

    /**
     * window.open returns mocked window
     * operation.refreshOperation is null
     */
    openSpy.and.returnValue(windowMock as any);

    component.performOperation(operation);

    performOperationSpy.calls.reset();
    window[`peClosePopUpOfTPM`]();

    expect(windowMock.focus).toHaveBeenCalled();
    expect(windowMock.close).toHaveBeenCalled();
    expect(performOperationSpy).not.toHaveBeenCalled();
    expect(lastRequestMock.subscribe).toHaveBeenCalled();

    /**
     * operation.refreshOperation is set
     */
    operation.refreshOperation = { test: true } as any;

    component.performOperation(operation, fieldset);

    performOperationSpy.calls.reset();
    performOperationSpy.and.stub();
    window[`peClosePopUpOfTPM`]();

    expect(performOperationSpy).toHaveBeenCalledWith({ test: true } as any, fieldset);

    /**
     * operation.open is null
     * operation.isSubmit is TRUE
     * component.submittedForm is null
     * component.form is set & invalid is TRUE
     */
    performOperationSpy.and.callThrough();
    operation.open = null;

    component.submittedForm = null;
    component.performOperation(operation, fieldset, true, () => { });

    expect(sendRequestSpy).not.toHaveBeenCalled();

    /**
     * component.submittedForm is set & invalid is TRUE
     */
    component.submittedForm = { invalid: true } as any;
    component.performOperation(operation, fieldset, true, () => { });

    expect(sendRequestSpy).not.toHaveBeenCalled();

    /**
     * operation.isSubmit is FALSE
     */
    operation.isSubmit = false;

    component.performOperation(operation, fieldset, true, () => { });

    expect(sendRequestSpy).toHaveBeenCalled();

    /**
     * component.submittedForm is null
     */
    sendRequestSpy.calls.reset();

    component.submittedForm = null;
    component.performOperation(operation, fieldset, true, () => { });

    expect(sendRequestSpy).toHaveBeenCalled();

  });

  it('should check if field async', () => {

    const fieldset = [
      {
        name: 'field 1',
        asyncSave: false,
      },
      {
        name: 'field 2',
        asyncSave: true,
      },
    ] as any;

    expect(component.isAsyncField('field 3', null)).toBeNull();
    expect(component.isAsyncField('field 1', fieldset)).toBe(false);
    expect(component.isAsyncField('field 2', fieldset)).toBe(true);

  });

  it('should check if has async field', () => {

    const fieldset = [
      {
        name: 'field 1',
        asyncSave: false,
      },
      {
        name: 'field 2',
        asyncSave: false,
      },
    ] as any;

    /**
     * there is no any async field
     */
    expect(component.hasAsyncField(fieldset)).toBe(false);

    /**
     * there is one async field
     */
    fieldset[0].asyncSave = true;
    expect(component.hasAsyncField(fieldset)).toBe(true);

  });

  it('should perform payever operation', () => {

    const fieldset = [{ test: true }] as any;
    const formMock = {
      value: {
        name: 'James Bond',
        code: '007',
        pe_test: true,
      },
    };
    const isAsyncFieldSpy = spyOn(component, 'isAsyncField');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const formSpy = spyOnProperty(component, 'form');

    /**
     * component.submittedForm & form are null
     */
    component.submittedForm = null;
    formSpy.and.returnValue(null);

    component.performPayeverOperation(fieldset);

    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.form is set
     * onlyForAsyncFields is FALSE as default
     * component.isAsyncField returns TRUE
     */
    formSpy.and.returnValue(formMock);
    isAsyncFieldSpy.and.returnValue(true);

    component.performPayeverOperation(fieldset);

    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.submittedForm is set
     * component.isAsyncField returns FALSE
     */
    component.submittedForm = formMock as any;
    isAsyncFieldSpy.and.returnValue(false);

    component.performPayeverOperation(fieldset);

    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * onlyForAsyncFields is TRUE
     * component.isAsyncField returns TRUE
     * component.handlePayeverFieldsSaveCallback is set
     */
    isAsyncFieldSpy.and.returnValue(true);

    const handleSpy = spyOn(component, 'handlePayeverFieldsSaveCallback').and.returnValue(of(true) as any);

    component.performPayeverOperation(fieldset, true);

    expect(handleSpy).toHaveBeenCalledWith({ pe_test: true });
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should perform toggle operation', () => {

    const elementMock = {
      toggle: jasmine.createSpy('toggle'),
    };
    const cellMock = {
      checked: true,
      requestOn: {
        url: 'request.on',
        method: 'get',
      },
      requestOff: {
        url: 'request.off',
        method: 'get',
      },
      actionOn: 'action.on',
      actionOff: 'action.off',
    };
    const performOperationSpy = spyOn(component, 'performOperation');

    /**
     * cell.checked is TRUE
     */
    component.performToggleOperation(elementMock as any, cellMock as any, null);

    expect(performOperationSpy).toHaveBeenCalled();
    let args = performOperationSpy.calls.argsFor(0);
    expect(args[0]).toEqual({
      request: cellMock.requestOff,
      action: cellMock.actionOff,
      actionData: {},
    });
    expect(args[1]).toBeNull();
    expect(args[2]).toBe(false);
    args[3]();

    expect(elementMock.toggle).toHaveBeenCalled();

    /**
     * cell.checked is FALSE
     */
    cellMock.checked = false;

    component.performToggleOperation(elementMock as any, cellMock as any, null);

    args = performOperationSpy.calls.argsFor(1);
    expect(args[0]).toEqual({
      request: cellMock.requestOn,
      action: cellMock.actionOn,
      actionData: {},
    });

  });

  it('should send request', () => {

    const operation = {
      actionData: { actionData: true },
      action: 'action',
      request: {
        url: null,
        method: null,
      },
    };
    const infoBoxSettingsSpy = spyOnProperty(component, 'infoBoxSettings').and.returnValue({ actionContext: { actionContext: true } });
    const isAsyncFieldSpy = spyOn(component, 'isAsyncField');
    const formSpy = spyOnProperty(component, 'form');
    const setInfoBoxSettingsSpy = spyOn(component, 'setInfoBoxSettings');
    const showErrorSpy = spyOn<any>(component, 'showError');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const formMock = {
      value: {
        name: 'James Bond',
        code: '007',
        pe_test: true,
      },
    };
    const fieldset = [{ test: true }];

    thirdPartyFormService.allowCustomActions.and.returnValue(true);
    thirdPartyFormService.executeAction.and.returnValue(of(null));

    component.baseApiData = {
      baseApiData: true,
    };
    component[`peAuthService`] = {
      token: 'auth.token',
    } as any;
    component[`activatedRoute`] = {
      snapshot: {
        queryParams: {},
      },
    } as any;

    /**
     * component.submittedForm & form is null
     * thirdPartyFormService.allowCustomActions returns TRUE
     * thirdPartyFormService.executeAction returns FALSE
     * operation.request.url is null
     */
    formSpy.and.returnValue(null);
    component.submittedForm = null;

    component.sendRequest(operation as any, fieldset as any);

    // expect(isAsyncFieldSpy).toHaveBeenCalledWith('pe_test', fieldset as any);
    expect(isAsyncFieldSpy).not.toHaveBeenCalled();
    expect(infoBoxSettingsSpy).toHaveBeenCalled();
    expect(thirdPartyFormService.allowCustomActions).toHaveBeenCalled();
    expect(thirdPartyFormService.executeAction).toHaveBeenCalledWith('action', {
      baseApiData: true,
      actionContext: true,
      actionData: true,
      action: 'action',
    });
    expect(setInfoBoxSettingsSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.form is set
     * request returns values with form
     * oepration.request.url is set
     */
    formSpy.and.returnValue(formMock);
    operation.request.url = 'request.url';
    thirdPartyFormService.executeAction.and.returnValue(of({ form: null }) as any);
    http.request.and.returnValue(of({ form: { test: true } }) as any);

    component.sendRequest(operation as any, fieldset as any, false, () => { });

    expect(http.request).toHaveBeenCalledWith(
      'POST',
      operation.request.url,
      {
        body: {
          baseApiData: true,
          name: 'James Bond',
          code: '007',
          actionContext: true,
          actionData: true,
          action: 'action',
        },
        headers: {
          authorization: 'Bearer auth.token',
        },
      },
    );
    expect(setInfoBoxSettingsSpy).toHaveBeenCalledWith({ test: true } as any);
    expect(showErrorSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.submittedForm is set
     * component.isAsyncField returns TRUE
     * request throws error
     * argument onFail is null as default
     * argument onlyForAsyncFields is TRUE
     */
    isAsyncFieldSpy.and.returnValue(true);
    component.submittedForm = formMock as any;
    http.request.and.returnValue(throwError({ message: 'test error' }));

    component.sendRequest(operation, fieldset as any, true);

    expect(showErrorSpy).toHaveBeenCalledWith('test error');
    expect(component.currentOperation).toBe(null);
    expect(component.formLoading).toBe(false);
    expect(detectSpy).toHaveBeenCalled();

    /**
     * argument onlyForAsyncFields is FALSE
     * argument onFail is set
     */
    component.sendRequest(operation, fieldset as any, false, () => { });

  });

  it('should set info box settings', fakeAsync(() => {

    const fileReaderMock = {
      readAsDataURL: jasmine.createSpy('readAsDataUrl'),
      onload: null,
      result: 'reader.result',
    };
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const updateSpy = spyOn(component, 'updateOperations');
    const setupSpy = spyOn<any>(component, 'setupForm');
    const printSpy = spyOn(window, 'print');
    const appendSpy = spyOn(document.body, 'appendChild');
    const removeSpy = spyOn(document.body, 'removeChild');
    const responseMock = {
      triggerDownloadUrl: null,
      triggerPrintUrl: null,
      type: null,
      operations: null,
    };
    let elem: HTMLAnchorElement;

    spyOn(window, 'FileReader').and.returnValue(fileReaderMock as any);

    component[`peAuthService`] = {
      token: 'auth.token',
    } as any;

    appendSpy.and.callFake((node) => {
      elem = node as any;
      spyOn(elem, 'click');

      return null;
    });

    /**
     * argument response is null
     * component.showForm is TRUE
     */
    component.showForm = true;
    component.setInfoBoxSettings(null);

    expect(http.get).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
    expect(fileReaderMock.readAsDataURL).not.toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalledTimes(1);
    expect(component.settingsNonFormSaved).toBeUndefined();
    expect(component.showForm).toBe(false);
    expect(component.formLoading).toBe(false);
    expect(component.currentOperation).toBeNull();
    expect(component.settings).toBeUndefined();

    /**
     * response.triggerDownloadUrl is set
     * http.get throws error
     * component.showForm is FALSE
     * component.settings is set
     */
    responseMock.triggerDownloadUrl = 'trigger/download.url';

    http.get.and.returnValue(throwError('test error'));

    component.settings = { test: true } as any;
    component.setInfoBoxSettings(responseMock as any);

    expect(http.get).toHaveBeenCalledWith(
      'trigger/download.url',
      {
        responseType: 'blob',
        headers: {
          authorization: 'Bearer auth.token',
        },
      },
    );
    expect(fileReaderMock.readAsDataURL).not.toHaveBeenCalled();
    expect(appendSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();

    /**
     * http.get returns mocked data
     */
    http.get.and.returnValue(of('blob'));

    component.setInfoBoxSettings(responseMock as any);
    fileReaderMock.onload();

    expect(fileReaderMock.readAsDataURL).toHaveBeenCalledWith('blob');
    expect(elem.target).toEqual('_blank');
    expect(elem.href).toEqual(`${window.location.origin}/reader.result`);
    expect(elem.download).toEqual('download.url');
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    /**
     * response.triggerPrintUrl is set
     * http.get throws error
     */
    fileReaderMock.readAsDataURL.calls.reset();
    fileReaderMock.onload = null;
    responseMock.triggerDownloadUrl = null;
    responseMock.triggerPrintUrl = 'trigger/print.url';

    http.get.and.returnValue(throwError('test error'));

    component.setInfoBoxSettings(responseMock as any);

    expect(http.get).toHaveBeenCalledWith(
      'trigger/print.url',
      {
        responseType: 'blob',
        headers: {
          authorization: 'Bearer auth.token',
        },
      },
    );
    expect(fileReaderMock.readAsDataURL).not.toHaveBeenCalled();
    expect(printSpy).not.toHaveBeenCalled();

    /**
     * http.get returns mocked data
     */
    http.get.and.returnValue(of('blob'));

    component.setInfoBoxSettings(responseMock as any);
    fileReaderMock.onload();

    tick();

    expect(fileReaderMock.readAsDataURL).toHaveBeenCalledWith('blob');
    expect(component.printImageUrl).toEqual('reader.result');
    expect(printSpy).toHaveBeenCalled();

    /**
     * response.type is 'info-box'
     * response.operations is null
     */
    responseMock.type = 'info-box';

    component.setInfoBoxSettings(responseMock as any);

    expect(component.settings).toEqual(responseMock as any);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith({});

    /**
     * response.operations is set
     */
    responseMock.operations = ['operation'];

    component.setInfoBoxSettings(responseMock as any);

    expect(component.settings).toEqual(responseMock as any);
    expect(updateSpy).toHaveBeenCalledWith(['operation'] as any);

    /**
     * response.type is 'confirm'
     */
    updateSpy.calls.reset();
    setupSpy.calls.reset();
    responseMock.type = 'confirm';

    component.setInfoBoxSettings(responseMock as any);

    expect(component.settings).toEqual(responseMock as any);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();

  }));

  it('should handle close', () => {

    const emitSpy = spyOn(component.onClose, 'emit');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.settingsNonFormSaved = { test: true } as any;
    component.settings = null;

    /**
     * component.showForm is FALSE
     */
    component.showForm = false;
    component.handleClose();

    expect(component.settings).toBeNull();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();

    /**
     * component.showForm is TRUE
     */
    emitSpy.calls.reset();

    component.showForm = true;
    component.handleClose();

    expect(component.settings).toEqual({ test: true } as any);
    expect(component.showForm).toBe(false);
    expect(detectSpy).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();

  });

  it('should get expanded index', () => {

    const accordionMock = [
      {
        disabled: true,
        hideToggle: true,
      },
      {
        disabled: true,
        hideToggle: true,
      },
      {
        disabled: false,
        hideToggle: false,
      },
    ];
    const infoBoxSettings = {
      content: {
        accordion: null,
      },
    };

    /**
     * component.expandedIndex is set
     */
    component.expandedIndex = 1;
    component.settings = infoBoxSettings as any;

    expect(component.getExpandedIndex()).toBe(1);

    /**
     * component.expandedIndex is null
     * component.infoBoxSettings.content.accordion is null
     */
    component.expandedIndex = null;

    expect(component.getExpandedIndex()).toBe(0);

    /**
     * component.infoBoxSettings.content.accordion is set
     */
    infoBoxSettings.content.accordion = accordionMock;

    expect(component.getExpandedIndex()).toBe(2);

  });

  it('should prepare fieldset data', () => {

    const fieldsDataMock = {
      test: true,
    };
    const payeverFieldsDataMock = {
      pe_test: true,
    };

    /**
     * argument fieldsData for prepareFieldsetData is null
     * component.payeverFieldsData is null
     */
    component.payeverFieldsData = null;
    expect(component.prepareFieldsetData(null)).toEqual({});

    /**
     * argument fieldsData for prepareFieldsetData is set
     * component.payeverFieldsData is set
     */
    component.payeverFieldsData = payeverFieldsDataMock as any;
    expect(component.prepareFieldsetData(fieldsDataMock)).toEqual({
      test: true,
      pe_test: true,
    });

  });

  it('should get img as inline', () => {

    const url = 'test-url/image.jpg';
    const fileReaderMock = {
      readAsDataURL: jasmine.createSpy('readAsDataUrl'),
      onload: null,
      result: 'reader.result',
    };

    spyOn(window, 'FileReader').and.returnValue(fileReaderMock as any);

    component[`peAuthService`] = {
      token: 'auth.token',
    } as any;

    /**
     * url exists in component.inlineImages
     */
    component[`inlineImages`][url] = new BehaviorSubject<string>('test.image');

    component.imgAsInline(url).subscribe(image => expect(image).toEqual('test.image'));
    expect(http.get).not.toHaveBeenCalled();
    expect(fileReaderMock.readAsDataURL).not.toHaveBeenCalled();

    /**
     * url does not exists in component.inlineImages
     * http.get throws error
     */
    http.get.and.returnValue(throwError('test error'));

    delete component[`inlineImages`][url];

    component.imgAsInline(url).subscribe(image => expect(image).toBeNull());
    expect(http.get).toHaveBeenCalledWith(
      url,
      {
        responseType: 'blob',
        headers: {
          authorization: 'Bearer auth.token',
        },
      },
    );
    expect(fileReaderMock.readAsDataURL).not.toHaveBeenCalled();

    /**
     * http.get returns mocked data
     * call fileReader.onload callback
     */
    http.get.and.returnValue(of('blob'));

    delete component[`inlineImages`][url];

    component.imgAsInline(url).pipe(skip(1)).subscribe(image => expect(image).toEqual('reader.result'));
    fileReaderMock.onload();

    expect(fileReaderMock.readAsDataURL).toHaveBeenCalled();

  });

  it('should translate', () => {

    /**
     * translateService.hasTranslate returns FALSE
     */
    translateService.hasTranslation.and.returnValue(false);

    expect(component.translate('key')).toEqual('key');
    expect(translateService.hasTranslation).toHaveBeenCalledWith('key');
    expect(translateService.translate).not.toHaveBeenCalled();

    /**
     * translateService.hasTranslate returns TRUE
     */
    translateService.hasTranslation.and.returnValue(true);

    expect(component.translate('key')).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledWith('key');

  });

  it('should get safe url', () => {

    const url = 'https://test.com';

    /**
     * url exists in component.safeUrls
     */
    component[`safeUrls`][url] = 'existing.url';

    expect(component.safeUrl(url)).toEqual('existing.url');
    expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();

    /**
     * url does not exist in component.safeUrls
     */
    delete component[`safeUrls`][url];

    expect(component.safeUrl(url)).toEqual('sanitized');
    expect(component[`safeUrls`][url]).toEqual('sanitized');
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url);

  });

  it('should get submitted form', () => {

    const formMock = {
      operation: {
        action: 'a-001',
      },
      form: { test: true },
    };

    component.infoBoxGeneratorForms = new QueryList<any>();
    component.infoBoxGeneratorForms.reset([formMock] as any);

    /**
     * argument actionId for getSubmittedForm function is null
     */
    expect(component[`getSubmittedForm`](null)).toBeNull();

    /**
     * argument actionId for getSubmittedForm function is set
     * operation.action is not equal to actionId
     */
    expect(component[`getSubmittedForm`]('a-002')).toBeNull();

    /**
     * operation.action is equal to actionId
     */
    expect(component[`getSubmittedForm`]('a-001')).toEqual(formMock.form as any);

  });

  it('should set up form', () => {

    const prepareSpy = spyOn(component, 'prepareFieldsetData').and.returnValue({ prepared: true });
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const args = {
      fieldset: null,
      fieldsetData: null,
    };

    /**
     * arguments fieldset & fieldsetData for setupForm function is null
     */
    component[`setupForm`](args);

    expect(prepareSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(component.showForm).toBe(false);

    /**
     * arguments fieldset & fieldsetData for setupForm function is set
     */
    args.fieldset = [{ test: 'fieldset' }];
    args.fieldsetData = { test: 'fieldsetData' };

    component[`setupForm`](args);

    expect(component.fieldset).toEqual([{ test: 'fieldset' }] as any);
    expect(component.fieldsetData).toEqual({ prepared: true });
    expect(component.showForm).toBe(true);
    expect(prepareSpy).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should show error', () => {

    const translateSpy = spyOn(component, 'translate').and.returnValue(null);

    /**
     * component.translate returns null
     */
    component[`showError`]('errors.test');

    expect(snackBarService.toggle).toHaveBeenCalledWith(
      true,
      'translated',
      {
        duration: 5000,
        iconId: 'icon-alert-24',
        iconSize: 24,
      },
    );
    expect(translateSpy).toHaveBeenCalledWith('errors.test');
    expect(translateService.translate).toHaveBeenCalledWith('errors.unknown_error');

    /**
     * component.translate returns mocked value
     */
    translateService.translate.calls.reset();
    translateSpy.and.returnValue('mocked.translate');

    component[`showError`]('errors.test');

    expect(snackBarService.toggle).toHaveBeenCalledWith(
      true,
      'mocked.translate',
      {
        duration: 5000,
        iconId: 'icon-alert-24',
        iconSize: 24,
      },
    );
    expect(translateSpy).toHaveBeenCalledWith('errors.test');
    expect(translateService.translate).not.toHaveBeenCalled();

  });

});
